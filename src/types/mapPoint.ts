import type { Centro } from './centro';
import type { ServicioAyuda } from './servicioAyuda';

// Los centros casi siempre solo se geocodifican a nivel de ciudad, así que en
// el mapa se agrupan en un único punto por ciudad (kind: 'ciudad') con la lista
// de centros adentro. Los servicios de ayuda sí van como puntos individuales.
export type MapPoint =
  | { kind: 'ciudad'; id: string; lat: number; lng: number; ciudad: string; centros: Centro[] }
  | { kind: 'servicio'; id: string; lat: number; lng: number; data: ServicioAyuda };
