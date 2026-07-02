import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseAdminConfig,
  isAuthorizedCronRequest,
  type HandlerRequest,
  type HandlerResponse,
} from '../server/cronAuth.js';

type Noticia = {
  titulo: string;
  resumen: string;
  fecha_publicacion: string;
  ciudad: string | null;
  fuente_nombre: string;
  fuente_url: string;
  confianza: 'alta' | 'media' | 'baja';
};

const RED_POR_VENEZUELA_OFICIAL_URL = 'https://redporvenezuela.com/oficial';
const MAX_SCRAPED_NOTICIAS = 50;

type ServicioAyuda = {
  nombre: string;
  categoria: 'emergencia' | 'medico' | 'psicosocial' | 'legal' | 'refugio' | 'otros';
  descripcion: string;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  ciudad: string | null;
  fuente_nombre: string;
  fuente_url: string;
  confianza: 'alta' | 'media' | 'baja';
};

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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const scrapeErrors: string[] = [];
  let scrapedNoticias: Noticia[] = [];

  try {
    const response = await fetch(RED_POR_VENEZUELA_OFICIAL_URL, {
      headers: { 'user-agent': 'HelpVenezuelaBot/1.0 (+https://helpvenezuela.local)' },
    });

    if (!response.ok) {
      throw new Error(`Red por Venezuela (oficial) respondio ${response.status}`);
    }

    const html = await response.text();
    scrapedNoticias = parseRedPorVenezuelaOficial(html);
  } catch (error) {
    scrapeErrors.push(
      error instanceof Error ? error.message : 'No se pudo leer Red por Venezuela (oficial)'
    );
  }

  const noticias = dedupeNoticias([...getNoticias(), ...scrapedNoticias]);
  const servicios = getServiciosAyuda();

  const { error: noticiasError } = await supabase
    .from('noticias')
    .upsert(noticias, { onConflict: 'fuente_nombre,titulo' });

  const { error: serviciosError } = await supabase
    .from('servicios_ayuda')
    .upsert(servicios, { onConflict: 'fuente_nombre,nombre' });

  if (noticiasError || serviciosError) {
    res.status(500).json({
      error: 'upsert failed',
      noticiasError: noticiasError?.message ?? null,
      serviciosError: serviciosError?.message ?? null,
      scrapeErrors,
    });
    return;
  }

  res.status(200).json({
    ok: true,
    noticias: noticias.length,
    noticiasScrapeadas: scrapedNoticias.length,
    servicios: servicios.length,
    scrapeErrors,
  });
}

// `servicios_ayuda` no tiene fuente en vivo (son lineas/contactos de ayuda,
// no un directorio estructurado): "actualizar" significa editar el array a
// mano, citando una fuente real, y hacer push. `noticias` en cambio combina
// dos fuentes: el array de abajo (curado a mano, mismo criterio que
// servicios_ayuda) mas un scrape en vivo de redporvenezuela.com/oficial, que
// SI es un directorio estructurado (no prosa) con titulo/fuente/fecha
// relativa por entrada — igual de parseable que /centros. El cron diario
// vuelve a subir todo (upsert por fuente_nombre+titulo / fuente_nombre+
// nombre), asi que no crea duplicados ni requiere volver a pegar SQL en
// Supabase.

function getNoticias(): Noticia[] {
  return [
    {
      titulo: 'Dos fuertes terremotos sacuden Venezuela el 24 de junio',
      resumen:
        'El 24 de junio de 2026 Venezuela fue sacudido por dos sismos con menos de un minuto de diferencia, de magnitud 7.2 y 7.5, con epicentro en el estado Yaracuy.',
      fecha_publicacion: '2026-06-24T00:00:00-04:00',
      ciudad: null,
      fuente_nombre: 'Wikipedia',
      fuente_url: 'https://es.wikipedia.org/wiki/Terremotos_de_Venezuela_de_2026',
      confianza: 'media',
    },
    {
      titulo: 'La cifra de víctimas sube a 1.943 fallecidos y más de 15 mil damnificados',
      resumen:
        'Corte al 30 de junio de 2026: 1.943 fallecidos, 10.571 heridos y más de 15 mil damnificados reportados tras los terremotos en Venezuela.',
      fecha_publicacion: '2026-06-30T00:00:00-04:00',
      ciudad: null,
      fuente_nombre: 'Univision',
      fuente_url:
        'https://www.univision.com/noticias/america-latina/ultimas-noticias-terremotos-venezuela-hoy-martes-30-junio-2026-en-vivo',
      confianza: 'media',
    },
    {
      titulo: 'Más de mil rescatistas internacionales se despliegan en Venezuela con apoyo de la ONU',
      resumen:
        'Equipos de búsqueda y rescate de Chile, Colombia, Estados Unidos, Italia, Suiza y otros países se suman a la respuesta internacional coordinada por Naciones Unidas.',
      fecha_publicacion: '2026-06-27T00:00:00-04:00',
      ciudad: null,
      fuente_nombre: 'Noticias ONU',
      fuente_url: 'https://news.un.org/es/story/2026/06/1541610',
      confianza: 'alta',
    },
    {
      titulo: 'Colombia envía el equipo de búsqueda y rescate USAR COL-1 a través de la UNGRD',
      resumen:
        'La Unidad Nacional para la Gestión del Riesgo de Desastres activó un equipo de más de 60 especialistas, cuatro binomios caninos y cerca de 12 toneladas de equipos especializados hacia Venezuela.',
      fecha_publicacion: '2026-06-25T00:00:00-05:00',
      ciudad: null,
      fuente_nombre: 'El Colombiano',
      fuente_url:
        'https://www.elcolombiano.com/inicio/terremoto-venezuela-colombia-enviara-ayuda-con-ungrd-GC38182150',
      confianza: 'media',
    },
    {
      titulo: 'Plataformas colombianas habilitan envíos de dinero a Venezuela sin cobro de comisión',
      resumen:
        'Varias plataformas de transferencias en Colombia eliminaron temporalmente la comisión para envíos de dinero a Venezuela, como apoyo a los afectados por el terremoto.',
      fecha_publicacion: '2026-06-29T00:00:00-05:00',
      ciudad: null,
      fuente_nombre: 'Infobae',
      fuente_url:
        'https://www.infobae.com/venezuela/2026/06/29/terremoto-en-venezuela-plataformas-en-colombia-permiten-transferencias-de-dinero-sin-cobro-de-comision-asi-funciona/',
      confianza: 'media',
    },
    {
      titulo: 'Delcy Rodríguez crea comisión presidencial para evaluar viviendas y extiende suspensión de clases',
      resumen:
        'El Ejecutivo venezolano ordenó inspeccionar con un sistema de semáforo (verde/amarillo/rojo) las viviendas e infraestructura afectadas por los sismos, y extendió la suspensión de clases una semana más.',
      fecha_publicacion: '2026-06-29T00:00:00-04:00',
      ciudad: null,
      fuente_nombre: 'Infobae',
      fuente_url:
        'https://www.infobae.com/venezuela/2026/06/29/delcy-rodriguez-habilito-una-comision-para-inspeccionar-las-viviendas-afectadas-por-los-terremotos-en-venezuela/',
      confianza: 'alta',
    },
    {
      titulo: 'China enviará 14,7 millones de dólares en ayuda humanitaria a Venezuela',
      resumen:
        'El gobierno chino anunció el envío de suministros de emergencia y ayuda para la reconstrucción, además de imágenes satelitales de las zonas afectadas para apoyar las labores de rescate.',
      fecha_publicacion: '2026-06-29T00:00:00-04:00',
      ciudad: null,
      fuente_nombre: 'teleSUR',
      fuente_url: 'https://www.telesurtv.net/china-ayuda-humanitaria-venezuela-sismos/',
      confianza: 'alta',
    },
    {
      titulo: 'Cancillería de Colombia habilita canal para enviar ayuda médica a Venezuela',
      resumen:
        'El gobierno colombiano estableció un procedimiento oficial para canalizar ayuda médica hacia Venezuela, como parte de la respuesta humanitaria a los terremotos.',
      fecha_publicacion: '2026-06-26T00:00:00-05:00',
      ciudad: null,
      fuente_nombre: 'El Tiempo',
      fuente_url:
        'https://www.eltiempo.com/mundo/venezuela/como-ayudar-a-los-afectados-por-los-terremotos-en-venezuela-organizaciones-y-canales-oficiales-para-donar-3567513',
      confianza: 'media',
    },
  ];
}

function getServiciosAyuda(): ServicioAyuda[] {
  return [
    {
      nombre: 'Cruz Roja Colombiana - Restablecimiento de Contacto entre Familiares (RCF)',
      categoria: 'emergencia',
      descripcion:
        'Ayuda a reestablecer contacto con familiares en Venezuela cuando las comunicaciones se interrumpen por el desastre. Servicio nacional, no requiere estar en una ciudad especifica.',
      direccion: null,
      telefono: null,
      whatsapp: '+57 321 213 9525',
      email: 'rcf@cruzrojacolombiana.org',
      ciudad: null,
      fuente_nombre: 'Semana',
      fuente_url:
        'https://www.semana.com/nacion/articulo/no-logra-contactar-a-un-familiar-en-venezuela-cruz-roja-colombiana-activo-linea-de-ayuda/202621/',
      confianza: 'alta',
    },
    {
      nombre: 'Línea de atención psicológica (Venezuela)',
      categoria: 'psicosocial',
      descripcion:
        'Línea telefónica gratuita en Venezuela, operada por un equipo multidisciplinario de psicólogos y psiquiatras, para atención psicológica tras los terremotos.',
      direccion: null,
      telefono: '0-800-29832-01',
      whatsapp: null,
      email: null,
      ciudad: null,
      fuente_nombre: 'teleSUR',
      fuente_url: 'https://www.telesurtv.net/venezuela-habilita-linea-atencion-psicologica/',
      confianza: 'media',
    },
    {
      nombre: 'Centro Intégrate Medellín',
      categoria: 'psicosocial',
      descripcion:
        'Orientación y apoyo emocional para personas afectadas por los terremotos en Venezuela, incluyendo quienes perdieron familiares o enfrentan situaciones traumáticas.',
      direccion: 'Carrera 49 #58-40, barrio Prado',
      telefono: null,
      whatsapp: null,
      email: null,
      ciudad: 'Medellín',
      fuente_nombre: 'El Espectador',
      fuente_url:
        'https://www.elespectador.com/colombia/donde-donar-alimentos-ropa-y-medicamentos-para-los-damnificados-por-terremotos-en-venezuela-lineas-de-ayuda-y-atencion-psicosocial/',
      confianza: 'media',
    },
    {
      nombre: 'Centro Intégrate Cartagena',
      categoria: 'psicosocial',
      descripcion: 'Orientación y apoyo emocional para personas afectadas por los terremotos en Venezuela.',
      direccion: null,
      telefono: null,
      whatsapp: null,
      email: null,
      ciudad: 'Cartagena',
      fuente_nombre: 'El Espectador',
      fuente_url:
        'https://www.elespectador.com/colombia/donde-donar-alimentos-ropa-y-medicamentos-para-los-damnificados-por-terremotos-en-venezuela-lineas-de-ayuda-y-atencion-psicosocial/',
      confianza: 'baja',
    },
    {
      nombre: 'Línea única nacional de emergencias (Venezuela)',
      categoria: 'emergencia',
      descripcion:
        'Número de emergencia 911, disponible a nivel nacional en Venezuela desde cualquier teléfono móvil o fijo.',
      direccion: null,
      telefono: '911',
      whatsapp: null,
      email: null,
      ciudad: null,
      fuente_nombre: 'Gobernación Bolivariana de Miranda',
      fuente_url: 'http://www.miranda.gob.ve/index.php/numeros-de-emergencia/',
      confianza: 'alta',
    },
    {
      nombre: 'Protección Civil Nacional (Venezuela)',
      categoria: 'emergencia',
      descripcion:
        'Línea nacional de Protección Civil de Venezuela para reportar emergencias y coordinar asistencia.',
      direccion: null,
      telefono: '0800-7248451',
      whatsapp: null,
      email: null,
      ciudad: null,
      fuente_nombre: 'Gobernación Bolivariana de Miranda',
      fuente_url: 'http://www.miranda.gob.ve/index.php/numeros-de-emergencia/',
      confianza: 'alta',
    },
  ];
}

// redporvenezuela.com/oficial es un directorio de noticias con markup
// consistente por tarjeta (no prosa libre): titulo en un atributo
// aria-label, extracto en un <blockquote>, fuente/ciudad tras un icono
// "Web" separadas por "•", link real a la nota, y un timestamp relativo
// ("hace 15 h") en vez de fecha absoluta. Todo se marca confianza 'baja'
// porque el propio sitio las etiqueta "Sin verificar".
function parseRedPorVenezuelaOficial(html: string): Noticia[] {
  const nowMs = Date.now();
  const blocks = html.split('<article').slice(1);
  const entries: Noticia[] = [];

  for (const block of blocks) {
    const tituloMatch = block.match(/aria-label="Ver detalle:\s*([^"]+)"/);
    if (!tituloMatch) continue;
    const titulo = decodeHtmlEntities(tituloMatch[1]).trim();

    const urlMatch = block.match(/<a href="(https?:\/\/[^"]+)"[^>]*target="_blank"/);
    if (!urlMatch) continue;
    const fuente_url = urlMatch[1];

    const metaMatch = block.match(/color:var\(--ink-2\)">([\s\S]*?)<\/div>/);
    const metaParts = metaMatch
      ? stripHtmlTags(metaMatch[1])
          .split('•')
          .map((part) => part.trim())
          .filter(Boolean)
      : [];
    const fuente_nombre = metaParts[1] || 'Red por Venezuela';
    const ciudad = metaParts[2] ?? null;

    const timeMatch = block.match(/>(\s*hace\s+[^<]+)</i);
    const fecha_publicacion = timeMatch
      ? parseRelativeTime(timeMatch[1], nowMs)
      : new Date(nowMs).toISOString();

    const blockquoteMatch = block.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/);
    const resumen = blockquoteMatch ? cleanResumen(blockquoteMatch[1]) : titulo;

    entries.push({
      titulo,
      resumen,
      fecha_publicacion,
      ciudad,
      fuente_nombre,
      fuente_url,
      confianza: 'baja',
    });
  }

  return entries.slice(0, MAX_SCRAPED_NOTICIAS);
}

function dedupeNoticias(noticias: Noticia[]): Noticia[] {
  const seen = new Set<string>();
  return noticias.filter((noticia) => {
    const key = `${noticia.fuente_nombre}:${noticia.titulo}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseRelativeTime(value: string, nowMs: number): string {
  const match = value.match(/hace\s+(\d+)\s*(min|h|d)\b/i);
  if (!match) return new Date(nowMs).toISOString();

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const ms = unit === 'min' ? amount * 60_000 : unit === 'h' ? amount * 3_600_000 : amount * 86_400_000;
  return new Date(nowMs - ms).toISOString();
}

function cleanResumen(raw: string): string {
  let text = stripHtmlTags(raw);
  text = decodeHtmlEntities(text);
  text = text.replace(/^[“"]+/, '').replace(/[”"]+$/, '');
  text = text.replace(/\s*La entrada .+? aparece primero en .+?\.?\s*$/i, '');
  text = text.replace(/\s*\[…\]\s*$/, '');
  return text.replace(/\s+/g, ' ').trim();
}

function stripHtmlTags(value: string): string {
  return value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return (
    value
      // redporvenezuela.com's feed double-encodes entities (literal
      // "&amp;#160;" instead of "&#160;"), so &amp; must be unescaped
      // first or the numeric replacements below never match.
      .replace(/&amp;/g, '&')
      // Numeric character references (decimal and hex) cover apostrophes
      // (&#x27;/&#39;), curly quotes (&#8220;/&#8221;), ellipsis (&#8230;),
      // nbsp (&#160;), etc. in one pass instead of listing each by hand.
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/&aacute;/g, 'á')
      .replace(/&eacute;/g, 'é')
      .replace(/&iacute;/g, 'í')
      .replace(/&oacute;/g, 'ó')
      .replace(/&uacute;/g, 'ú')
      .replace(/&ntilde;/g, 'ñ')
  );
}
