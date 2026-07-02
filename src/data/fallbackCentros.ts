import type { Centro } from '../types/centro';

const fuenteUrl =
  'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html';

const baseCentro = {
  created_at: '2026-06-27T12:00:00-05:00',
  organizacion: 'Bomberos Oficiales de Bogotá / IDPYBA',
  pais: 'Colombia',
  ciudad: 'Bogotá',
  estado: 'activo',
  tipos_donacion: ['mascotas', 'comida', 'medicina', 'otros'],
  telefono: null,
  whatsapp: null,
  publicacion_url: fuenteUrl,
  descripcion:
    'Punto reportado para alimentos, medicamentos veterinarios, platos desechables y otros insumos para animales afectados. Verificar vigencia antes de donar.',
  verificado: false,
  fuente_nombre: 'Tropicana / Bomberos Bogotá',
  fuente_url: fuenteUrl,
  ultima_revision: '2026-06-27T12:00:00-05:00',
  ultima_vista: '2026-06-27T12:00:00-05:00',
  confianza: 'media',
  lat: null,
  lng: null,
} satisfies Omit<Centro, 'id' | 'nombre' | 'direccion' | 'external_id'>;

export const FALLBACK_CENTROS: Centro[] = [
  {
    ...baseCentro,
    id: 'fallback-bogota-bomberos-puente-aranda',
    nombre: 'Bomberos Bogotá - Estación Puente Aranda',
    direccion: 'Calle 20 #68A-06',
    external_id: 'bogota-bomberos-puente-aranda-2026-06',
  },
  {
    ...baseCentro,
    id: 'fallback-bogota-bomberos-kennedy',
    nombre: 'Bomberos Bogotá - Estación Kennedy',
    direccion: 'Carrera 79 #41D-20 sur',
    external_id: 'bogota-bomberos-kennedy-2026-06',
  },
  {
    ...baseCentro,
    id: 'fallback-bogota-bomberos-chapinero',
    nombre: 'Bomberos Bogotá - Estación Chapinero',
    direccion: 'Carrera Novena A #61-77',
    external_id: 'bogota-bomberos-chapinero-2026-06',
  },
  {
    ...baseCentro,
    id: 'fallback-bogota-bomberos-restrepo',
    nombre: 'Bomberos Bogotá - Estación Restrepo',
    direccion: 'Avenida carrera 27 #19A-10 sur',
    external_id: 'bogota-bomberos-restrepo-2026-06',
  },
];
