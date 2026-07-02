import type { Centro } from './centro';
import type { ServicioAyuda } from './servicioAyuda';

export type MapPoint =
  | { id: string; kind: 'centro'; lat: number; lng: number; data: Centro }
  | { id: string; kind: 'servicio'; lat: number; lng: number; data: ServicioAyuda };
