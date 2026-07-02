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

  const noticias = getNoticias();
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
    });
    return;
  }

  res.status(200).json({
    ok: true,
    noticias: noticias.length,
    servicios: servicios.length,
  });
}

// Estos dos arrays son la unica fuente de noticias/servicios de ayuda: no hay
// scraping en vivo (son articulos de prensa en prosa, no un directorio
// estructurado), asi que "actualizar" significa editar estos arrays a mano,
// citando una fuente real, y hacer push. El cron diario los vuelve a subir
// (upsert por fuente_nombre+titulo / fuente_nombre+nombre), asi que no crea
// duplicados ni requiere volver a pegar SQL en Supabase.

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
  ];
}
