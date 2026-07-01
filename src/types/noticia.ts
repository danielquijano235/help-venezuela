import type { ConfianzaDato } from './centro';

export interface Noticia {
  id: string;
  created_at: string;
  titulo: string;
  resumen: string;
  fecha_publicacion: string;
  ciudad: string | null;
  fuente_nombre: string;
  fuente_url: string;
  confianza: ConfianzaDato;
}
