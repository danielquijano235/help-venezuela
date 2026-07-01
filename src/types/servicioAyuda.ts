import type { ConfianzaDato } from './centro';

export type CategoriaServicio =
  | 'emergencia'
  | 'medico'
  | 'psicosocial'
  | 'legal'
  | 'refugio'
  | 'otros';

export interface ServicioAyuda {
  id: string;
  created_at: string;
  nombre: string;
  categoria: CategoriaServicio;
  descripcion: string;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  ciudad: string | null;
  fuente_nombre: string;
  fuente_url: string;
  confianza: ConfianzaDato;
}
