export type Estado = 'urgente' | 'activo' | 'cerrado';

export type TipoDonacion =
  | 'medicina'
  | 'agua'
  | 'comida'
  | 'panales'
  | 'higiene'
  | 'ropa'
  | 'mascotas'
  | 'otros';

export type ConfianzaDato = 'alta' | 'media' | 'baja';

export interface Centro {
  id: string;
  created_at: string;
  nombre: string;
  organizacion: string | null;
  ciudad: string;
  direccion: string;
  estado: Estado;
  tipos_donacion: TipoDonacion[];
  telefono: string | null;
  whatsapp: string | null;
  publicacion_url: string | null;
  descripcion: string | null;
  verificado: boolean;
  fuente_nombre: string | null;
  fuente_url: string | null;
  external_id: string | null;
  ultima_revision: string | null;
  ultima_vista: string | null;
  confianza: ConfianzaDato;
}

// Forma que envia el formulario publico. id/created_at/verificado y metadatos
// de fuente los controla el servidor o el scraper, nunca el cliente publico.
export type NewCentro = Omit<
  Centro,
  | 'id'
  | 'created_at'
  | 'verificado'
  | 'fuente_nombre'
  | 'fuente_url'
  | 'external_id'
  | 'ultima_revision'
  | 'ultima_vista'
  | 'confianza'
>;
