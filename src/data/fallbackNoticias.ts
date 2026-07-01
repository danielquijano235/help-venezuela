import type { Noticia } from '../types/noticia';

export const FALLBACK_NOTICIAS: Noticia[] = [
  {
    id: 'fallback-noticia-terremotos',
    created_at: '2026-06-24T00:00:00-04:00',
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
    id: 'fallback-noticia-rescatistas-onu',
    created_at: '2026-06-27T00:00:00-04:00',
    titulo: 'Más de mil rescatistas internacionales se despliegan en Venezuela con apoyo de la ONU',
    resumen:
      'Equipos de búsqueda y rescate de Chile, Colombia, Estados Unidos, Italia, Suiza y otros países se suman a la respuesta internacional coordinada por Naciones Unidas.',
    fecha_publicacion: '2026-06-27T00:00:00-04:00',
    ciudad: null,
    fuente_nombre: 'Noticias ONU',
    fuente_url: 'https://news.un.org/es/story/2026/06/1541610',
    confianza: 'alta',
  },
];
