import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseAdminConfig,
  isAuthorizedCronRequest,
  type HandlerRequest,
  type HandlerResponse,
} from '../server/cronAuth.js';

type ScrapedCentro = {
  nombre: string;
  organizacion: string | null;
  ciudad: string;
  direccion: string;
  estado: 'urgente' | 'activo' | 'cerrado';
  tipos_donacion: string[];
  telefono: string | null;
  whatsapp: string | null;
  publicacion_url: string | null;
  descripcion: string | null;
  verificado: false;
  fuente_nombre: string;
  fuente_url: string;
  external_id: string;
  ultima_revision: string;
  ultima_vista: string;
  confianza: 'alta' | 'media' | 'baja';
};

const RED_POR_VENEZUELA_URL = 'https://redporvenezuela.com/centros';
const TROPICANA_SOURCE_URL =
  'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html';
const EL_TIEMPO_MEDELLIN_URL =
  'https://www.eltiempo.com/colombia/medellin/asi-puede-apoyar-a-las-personas-afectadas-por-los-terremotos-en-venezuela-desde-medellin-donaciones-centros-de-acopio-y-busqueda-de-desaparecidos-3567045';
const VANGUARDIA_BUCARAMANGA_URL =
  'https://www.vanguardia.com/area-metropolitana/bucaramanga/2026/06/26/solidaridad-con-venezuela-mas-puntos-donde-puede-realizar-donaciones-para-los-damnificados/';
const LA_OPINION_CUCUTA_URL =
  'https://laopinion.co/region/ejercito-nacional-habilita-puntos-de-acopio-en-cucuta-y-bucaramanga-para-ayudar-venezuela';
const EL_HERALDO_BARRANQUILLA_URL =
  'https://www.elheraldo.co/atlantico/2026/06/26/quiere-ayudar-a-venezuela-estos-son-otros-centros-de-acopio-en-barranquilla-que-reciben-donaciones/';
const TUBARCO_CALI_URL = 'https://tubarco.news/centros-de-acopio-para-venezuela-en-cali-donde-donar-ayudas/';

const COLOMBIA_CITIES = [
  'Bogotá',
  'Bogota',
  'Medellín',
  'Medellin',
  'Cali',
  'Cúcuta',
  'Cucuta',
  'Barranquilla',
  'Bucaramanga',
  'Valledupar',
  'Colombia',
];

export default async function handler(req: HandlerRequest, res: HandlerResponse) {
  if (req.method && !['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthorizedCronRequest(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabaseAdminConfig = getSupabaseAdminConfig();
  if (!supabaseAdminConfig) {
    res.status(500).json({
      error: 'Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    });
    return;
  }
  const { supabaseUrl, serviceRoleKey } = supabaseAdminConfig;

  const nowIso = new Date().toISOString();
  const centros = [
    ...getOfficialSeedCentros(nowIso),
    ...getMedellinSeedCentros(nowIso),
    ...getBucaramangaSeedCentros(nowIso),
    ...getCucutaSeedCentros(nowIso),
    ...getBarranquillaSeedCentros(nowIso),
    ...getCaliSeedCentros(nowIso),
  ];
  const scrapeErrors: string[] = [];

  try {
    const response = await fetch(RED_POR_VENEZUELA_URL, {
      headers: {
        'user-agent': 'HelpVenezuelaBot/1.0 (+https://helpvenezuela.local)',
      },
    });

    if (!response.ok) {
      throw new Error(`Red por Venezuela respondio ${response.status}`);
    }

    const html = await response.text();
    centros.push(...parseRedPorVenezuela(html, nowIso));
  } catch (error) {
    scrapeErrors.push(error instanceof Error ? error.message : 'No se pudo leer Red por Venezuela');
  }

  const uniqueCentros = dedupeBySourceId(centros);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from('centros')
    .upsert(uniqueCentros, { onConflict: 'fuente_nombre,external_id' });

  if (error) {
    res.status(500).json({ error: error.message, scrapeErrors });
    return;
  }

  const porCiudad = uniqueCentros.reduce<Record<string, number>>((acc, centro) => {
    acc[centro.ciudad] = (acc[centro.ciudad] ?? 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    ok: true,
    upserted: uniqueCentros.length,
    porCiudad,
    redPorVenezuela: uniqueCentros.filter((centro) => centro.fuente_nombre === 'Red por Venezuela')
      .length,
    scrapeErrors,
  });
}

function getOfficialSeedCentros(nowIso: string): ScrapedCentro[] {
  const base = {
    organizacion: 'Bomberos Oficiales de Bogotá / IDPYBA',
    ciudad: 'Bogotá',
    estado: 'activo',
    tipos_donacion: ['mascotas', 'comida', 'medicina', 'otros'],
    telefono: null,
    whatsapp: null,
    publicacion_url: TROPICANA_SOURCE_URL,
    descripcion:
      'Punto reportado para alimentos, medicamentos veterinarios, platos desechables y otros insumos para animales afectados. Verificar vigencia antes de donar.',
    verificado: false,
    fuente_nombre: 'Tropicana / Bomberos Bogotá',
    fuente_url: TROPICANA_SOURCE_URL,
    ultima_revision: '2026-06-27T12:00:00-05:00',
    ultima_vista: nowIso,
    confianza: 'media',
  } satisfies Omit<ScrapedCentro, 'nombre' | 'direccion' | 'external_id'>;

  return [
    {
      ...base,
      nombre: 'Bomberos Bogotá - Estación Puente Aranda',
      direccion: 'Calle 20 #68A-06',
      external_id: 'bogota-bomberos-puente-aranda-2026-06',
    },
    {
      ...base,
      nombre: 'Bomberos Bogotá - Estación Kennedy',
      direccion: 'Carrera 79 #41D-20 sur',
      external_id: 'bogota-bomberos-kennedy-2026-06',
    },
    {
      ...base,
      nombre: 'Bomberos Bogotá - Estación Chapinero',
      direccion: 'Carrera Novena A #61-77',
      external_id: 'bogota-bomberos-chapinero-2026-06',
    },
    {
      ...base,
      nombre: 'Bomberos Bogotá - Estación Restrepo',
      direccion: 'Avenida carrera 27 #19A-10 sur',
      external_id: 'bogota-bomberos-restrepo-2026-06',
    },
  ];
}

function getMedellinSeedCentros(nowIso: string): ScrapedCentro[] {
  return [
    {
      nombre: 'Institución Educativa Héctor Abad Gómez - Sede Placita de Flores',
      organizacion: null,
      ciudad: 'Medellín',
      direccion: 'Calle 50 #39-65',
      estado: 'activo',
      tipos_donacion: ['agua', 'comida', 'medicina', 'ropa', 'otros'],
      telefono: null,
      whatsapp: null,
      publicacion_url: EL_TIEMPO_MEDELLIN_URL,
      descripcion:
        'Punto de acopio reportado por El Tiempo: agua potable, alimentos no perecederos, insumos médicos, ropa y abrigos. Horario 8:00 a.m. a 5:00 p.m. Verificar vigencia antes de donar.',
      verificado: false,
      fuente_nombre: 'El Tiempo',
      fuente_url: EL_TIEMPO_MEDELLIN_URL,
      external_id: 'medellin-ie-hector-abad-gomez-placita-flores-2026-06',
      ultima_revision: '2026-06-30T12:00:00-05:00',
      ultima_vista: nowIso,
      confianza: 'media',
    },
  ];
}

function getBucaramangaSeedCentros(nowIso: string): ScrapedCentro[] {
  const base = {
    ciudad: 'Bucaramanga',
    estado: 'activo',
    telefono: null,
    whatsapp: null,
    publicacion_url: VANGUARDIA_BUCARAMANGA_URL,
    verificado: false,
    fuente_nombre: 'Vanguardia',
    fuente_url: VANGUARDIA_BUCARAMANGA_URL,
    ultima_revision: '2026-06-30T12:00:00-05:00',
    ultima_vista: nowIso,
    confianza: 'media',
  } satisfies Omit<
    ScrapedCentro,
    'nombre' | 'organizacion' | 'direccion' | 'tipos_donacion' | 'descripcion' | 'external_id'
  >;

  return [
    {
      ...base,
      nombre: 'Punto de acopio San Francisco',
      organizacion: null,
      direccion: 'Calle 18 #21-52, San Francisco (diagonal a la Iglesia San Francisco)',
      tipos_donacion: ['higiene', 'ropa', 'comida', 'panales', 'medicina', 'otros'],
      descripcion:
        'Reportado por Vanguardia: aseo personal, frazadas para clima cálido, alimentos no perecederos, pañales y medicamentos. Horario 7:00 a.m. a 7:00 p.m. Verificar vigencia antes de donar.',
      external_id: 'bucaramanga-san-francisco-2026-06',
    },
    {
      ...base,
      nombre: 'El Minuto de Dios - Punto de acopio Bucaramanga',
      organizacion: 'Corporación El Minuto de Dios',
      direccion: 'Carrera 27 #19-40, oficina COMD',
      tipos_donacion: ['comida', 'ropa', 'higiene', 'otros'],
      descripcion: 'Punto de acopio reportado por Vanguardia. Verificar vigencia antes de donar.',
      external_id: 'bucaramanga-minuto-de-dios-2026-06',
    },
    {
      ...base,
      nombre: 'Banco de Alimentos de Bucaramanga',
      organizacion: 'Banco de Alimentos de Bucaramanga',
      direccion: 'Carrera 20 #11-46',
      tipos_donacion: ['comida', 'otros'],
      descripcion: 'Punto de acopio reportado por Vanguardia. Verificar vigencia antes de donar.',
      external_id: 'bucaramanga-banco-alimentos-2026-06',
    },
  ];
}

function getCucutaSeedCentros(nowIso: string): ScrapedCentro[] {
  const base = {
    ciudad: 'Cúcuta',
    estado: 'activo',
    telefono: null,
    whatsapp: null,
    publicacion_url: LA_OPINION_CUCUTA_URL,
    verificado: false,
    fuente_nombre: 'La Opinión',
    fuente_url: LA_OPINION_CUCUTA_URL,
    ultima_revision: '2026-06-27T12:00:00-05:00',
    ultima_vista: nowIso,
    confianza: 'media',
  } satisfies Omit<
    ScrapedCentro,
    'nombre' | 'organizacion' | 'direccion' | 'tipos_donacion' | 'descripcion' | 'external_id'
  >;

  return [
    {
      ...base,
      nombre: 'Punto de acopio Centro Comercial Gran Sam',
      organizacion: 'Vente Venezuela',
      direccion: 'Calle 11A # 7, Centro Comercial Gran Sam, 2do piso, local 243 GS',
      tipos_donacion: ['comida', 'ropa', 'higiene', 'medicina', 'otros'],
      descripcion: 'Punto de acopio reportado por La Opinión. Verificar vigencia antes de donar.',
      external_id: 'cucuta-gran-sam-2026-06',
    },
    {
      ...base,
      nombre: 'El Minuto de Dios - Punto de acopio Cúcuta',
      organizacion: 'Corporación El Minuto de Dios',
      direccion: 'Avenida 1E #20-56, barrio Blanco-Caobos',
      tipos_donacion: ['comida', 'ropa', 'higiene', 'otros'],
      descripcion: 'Punto de acopio reportado por La Opinión. Verificar vigencia antes de donar.',
      external_id: 'cucuta-minuto-de-dios-2026-06',
    },
    {
      ...base,
      nombre: 'Fundación Banco Diocesano de Alimentos Monseñor Óscar Urbina Ortega',
      organizacion: 'Fundación Banco Diocesano de Alimentos Monseñor Óscar Urbina Ortega',
      direccion: 'Calle 2AN #1-26, Pescadero',
      tipos_donacion: ['comida', 'otros'],
      descripcion: 'Punto de acopio reportado por La Opinión. Verificar vigencia antes de donar.',
      external_id: 'cucuta-banco-diocesano-alimentos-2026-06',
    },
  ];
}

function getBarranquillaSeedCentros(nowIso: string): ScrapedCentro[] {
  const base = {
    ciudad: 'Barranquilla',
    estado: 'activo',
    telefono: null,
    whatsapp: null,
    publicacion_url: EL_HERALDO_BARRANQUILLA_URL,
    verificado: false,
    fuente_nombre: 'El Heraldo',
    fuente_url: EL_HERALDO_BARRANQUILLA_URL,
    ultima_revision: '2026-06-29T12:00:00-05:00',
    ultima_vista: nowIso,
    confianza: 'media',
  } satisfies Omit<
    ScrapedCentro,
    'nombre' | 'organizacion' | 'direccion' | 'tipos_donacion' | 'descripcion' | 'external_id'
  >;

  return [
    {
      ...base,
      nombre: 'Centro de Acopio Alcaldía Distrital de Barranquilla',
      organizacion: 'Alcaldía Distrital de Barranquilla',
      direccion: 'Carrera 43 #6-120, Barranquillita',
      tipos_donacion: ['agua', 'comida', 'medicina', 'ropa', 'otros'],
      descripcion:
        'Reportado por El Heraldo: agua potable, alimentos no perecederos, medicamentos e insumos médicos, ropa en buen estado, cobijas, colchonetas y aseo personal. Horario 8:00 a.m. a 4:00 p.m. Verificar vigencia antes de donar.',
      external_id: 'barranquilla-alcaldia-distrital-2026-06',
    },
    {
      ...base,
      nombre: 'Punto de acopio comerciantes Mall Plaza Paris',
      organizacion: null,
      direccion: 'Carrera 43 con Calle 37, frente a Mall Plaza Paris',
      tipos_donacion: ['comida', 'ropa', 'otros'],
      descripcion: 'Punto de acopio reportado por El Heraldo. Verificar vigencia antes de donar.',
      external_id: 'barranquilla-comerciantes-mall-plaza-paris-2026-06',
    },
  ];
}

function getCaliSeedCentros(nowIso: string): ScrapedCentro[] {
  const base = {
    ciudad: 'Cali',
    estado: 'activo',
    telefono: null,
    whatsapp: null,
    publicacion_url: TUBARCO_CALI_URL,
    verificado: false,
    fuente_nombre: 'TuBarco Noticias',
    fuente_url: TUBARCO_CALI_URL,
    ultima_revision: '2026-06-28T12:00:00-05:00',
    ultima_vista: nowIso,
    confianza: 'baja',
  } satisfies Omit<
    ScrapedCentro,
    'nombre' | 'organizacion' | 'direccion' | 'tipos_donacion' | 'descripcion' | 'external_id'
  >;

  return [
    {
      ...base,
      nombre: 'Funcolven',
      organizacion: 'Funcolven',
      direccion: 'Carrera 44A #13B-30, Santo Domingo',
      tipos_donacion: ['comida', 'ropa', 'otros'],
      descripcion: 'Punto de acopio reportado por TuBarco Noticias. Verificar vigencia antes de donar.',
      external_id: 'cali-funcolven-2026-06',
    },
    {
      ...base,
      nombre: 'Fundación Productiva-Mente',
      organizacion: 'Fundación Productiva-Mente',
      direccion: 'Carrera 12A #52-54, Villacolombia',
      tipos_donacion: ['comida', 'ropa', 'otros'],
      descripcion: 'Punto de acopio reportado por TuBarco Noticias. Verificar vigencia antes de donar.',
      external_id: 'cali-productiva-mente-2026-06',
    },
    {
      ...base,
      nombre: 'Colectivo Luchando por un Sueño',
      organizacion: 'Colectivo Luchando por un Sueño',
      direccion: 'Carrera 13 #63-33, Nueva Base',
      tipos_donacion: ['comida', 'ropa', 'otros'],
      descripcion: 'Punto de acopio reportado por TuBarco Noticias. Verificar vigencia antes de donar.',
      external_id: 'cali-luchando-por-un-sueno-2026-06',
    },
  ];
}

function parseRedPorVenezuela(html: string, nowIso: string): ScrapedCentro[] {
  const text = htmlToLines(preserveUsefulLinks(html));
  const entries: ScrapedCentro[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const status = parseStatus(text[index]);
    if (!status) continue;

    const block = text.slice(index, findNextStatusIndex(text, index + 1));
    const name = findName(block);
    if (!name) continue;

    const blockText = block.join(' ');
    if (!COLOMBIA_CITIES.some((city) => includesInsensitive(blockText, city))) continue;

    const mapsUrl = block.find((line) => line.includes('google.com/maps')) ?? null;
    const detailUrl = block.find((line) => line.includes('/centro/')) ?? null;
    const direccion = extractMapsQuery(mapsUrl) ?? inferAddress(blockText) ?? 'Dirección por confirmar';
    const ciudad = inferCity(blockText) ?? 'Bogotá';
    const tipos = parseDonationTypes(blockText);
    const sourceUrl = detailUrl ? absoluteRedUrl(detailUrl) : RED_POR_VENEZUELA_URL;

    entries.push({
      nombre: name,
      organizacion: null,
      ciudad,
      direccion,
      estado: status,
      tipos_donacion: tipos.length ? tipos : ['otros'],
      telefono: null,
      whatsapp: null,
      publicacion_url: sourceUrl,
      descripcion: 'Dato importado automaticamente desde Red por Venezuela. Verificar vigencia antes de donar.',
      verificado: false,
      fuente_nombre: 'Red por Venezuela',
      fuente_url: sourceUrl,
      external_id: detailUrl ? detailUrlToId(detailUrl) : slugify(`${name}-${ciudad}-${direccion}`),
      ultima_revision: nowIso,
      ultima_vista: nowIso,
      confianza: 'baja',
    });
  }

  return entries.slice(0, 80);
}

function preserveUsefulLinks(html: string) {
  return html.replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href: string, label: string) => {
      const cleanLabel = stripTags(label).trim();
      return `\n${cleanLabel}\n${href}\n`;
    }
  );
}

function htmlToLines(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '\n')
      .replace(/<style[\s\S]*?<\/style>/gi, '\n')
      .replace(/<[^>]+>/g, '\n')
  )
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, ' ');
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ');
}

function parseStatus(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'URGENTE' || normalized === 'NECESITA') return 'urgente';
  if (normalized === 'ABASTECIDO' || normalized === 'ACTIVO') return 'activo';
  if (normalized === 'CERRADO') return 'cerrado';
  return null;
}

function findNextStatusIndex(lines: string[], start: number) {
  const next = lines.findIndex((line, offset) => offset >= start && Boolean(parseStatus(line)));
  return next === -1 ? lines.length : next;
}

function findName(block: string[]) {
  return (
    block.find((line, index) => {
      if (index === 0) return false;
      if (line.includes('Sin verificar')) return false;
      if (line.includes('Verificar vigencia')) return false;
      if (line.includes('google.com')) return false;
      if (line.includes('/centro/')) return false;
      if (line === 'Cómo llegar' || line === 'Detalle') return false;
      return line.length >= 3;
    }) ?? null
  );
}

function parseDonationTypes(value: string) {
  const types: string[] = [];
  const candidates: [string, string][] = [
    ['Medicina', 'medicina'],
    ['Agua', 'agua'],
    ['Comida', 'comida'],
    ['Pañales', 'panales'],
    ['Panales', 'panales'],
    ['Higiene', 'higiene'],
    ['Ropa', 'ropa'],
    ['Mascotas', 'mascotas'],
  ];

  for (const [needle, tipo] of candidates) {
    if (includesInsensitive(value, needle)) types.push(tipo);
  }

  return [...new Set(types)];
}

function inferCity(value: string) {
  if (includesInsensitive(value, 'Bogotá') || includesInsensitive(value, 'Bogota')) return 'Bogotá';
  if (includesInsensitive(value, 'Medellín') || includesInsensitive(value, 'Medellin')) return 'Medellín';
  if (includesInsensitive(value, 'Cúcuta') || includesInsensitive(value, 'Cucuta')) return 'Cúcuta';
  if (includesInsensitive(value, 'Barranquilla')) return 'Barranquilla';
  if (includesInsensitive(value, 'Bucaramanga')) return 'Bucaramanga';
  if (includesInsensitive(value, 'Valledupar')) return 'Valledupar';
  if (includesInsensitive(value, 'Cali')) return 'Cali';
  return null;
}

function inferAddress(value: string) {
  const addressMatch = value.match(
    /((?:calle|carrera|avenida|av\.|cra\.|cl\.|kr\.)\s+[a-z0-9#\-\s]+(?:sur)?)/i
  );
  return addressMatch?.[1]?.trim() ?? null;
}

function extractMapsQuery(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const query = url.searchParams.get('query') ?? url.searchParams.get('q');
    return query ? decodeURIComponent(query).replace(/\+/g, ' ') : null;
  } catch {
    return null;
  }
}

function detailUrlToId(value: string) {
  return slugify(value.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, ''));
}

function absoluteRedUrl(value: string) {
  try {
    return new URL(value, RED_POR_VENEZUELA_URL).toString();
  } catch {
    return RED_POR_VENEZUELA_URL;
  }
}

function includesInsensitive(value: string, needle: string) {
  return normalize(value).includes(normalize(needle));
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugify(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function dedupeBySourceId(centros: ScrapedCentro[]) {
  const seen = new Set<string>();
  return centros.filter((centro) => {
    const key = `${centro.fuente_nombre}:${centro.external_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
