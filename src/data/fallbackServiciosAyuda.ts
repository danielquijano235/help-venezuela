import type { ServicioAyuda } from '../types/servicioAyuda';

export const FALLBACK_SERVICIOS_AYUDA: ServicioAyuda[] = [
  {
    id: 'fallback-servicio-cruz-roja-rcf',
    created_at: '2026-06-25T00:00:00-05:00',
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
    id: 'fallback-servicio-linea-psicologica-venezuela',
    created_at: '2026-06-26T00:00:00-04:00',
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
];
