-- HelpVenezuela: esquema de la tabla de centros de acopio
-- Ejecutar en el SQL editor del proyecto de Supabase.

create table if not exists public.centros (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  nombre           text not null,
  organizacion     text,
  pais             text not null default 'Colombia'
                     check (pais in ('Colombia', 'Venezuela')),
  ciudad           text not null,
  direccion        text not null,
  estado           text not null default 'activo'
                     check (estado in ('urgente', 'activo', 'cerrado')),
  tipos_donacion   text[] not null default '{}'
                     check (tipos_donacion <@ array[
                       'medicina',
                       'agua',
                       'comida',
                       'panales',
                       'higiene',
                       'ropa',
                       'mascotas',
                       'otros'
                     ]::text[]),
  telefono         text,
  whatsapp         text,
  publicacion_url  text,
  descripcion      text,
  verificado       boolean not null default false,
  fuente_nombre    text,
  fuente_url       text,
  external_id      text,
  ultima_revision  timestamptz,
  ultima_vista     timestamptz,
  confianza        text not null default 'media'
                     check (confianza in ('alta', 'media', 'baja'))
);

create unique index if not exists centros_fuente_external_id_uidx
  on public.centros (fuente_nombre, external_id);

-- Row Level Security -----------------------------------------------------
-- La anon key va incluida en el bundle del frontend por diseno (es publica).
-- La seguridad real se aplica aca, con estas politicas, no ocultando la key.

alter table public.centros enable row level security;

-- Lectura publica: incluye centros no verificados a proposito (ver README).
create policy "centros_public_select"
  on public.centros for select
  to anon, authenticated
  using (true);

-- Insercion publica: cualquiera puede sugerir un centro, pero nunca puede
-- marcarse a si mismo como verificado (WITH CHECK lo fuerza en el server).
create policy "centros_public_insert"
  on public.centros for insert
  to anon, authenticated
  with check (verificado = false);

-- No existe politica de UPDATE/DELETE para anon/authenticated: RLS deniega
-- por defecto, asi que la anon key nunca puede editar ni borrar filas.
-- La verificacion/moderacion se hace manualmente desde el Table Editor de
-- Supabase (con la sesion del dueno del proyecto, no con la anon key).

-- Noticias -----------------------------------------------------------------
-- Contenido 100% editorial: se carga a mano via SQL Editor (ver
-- seed_noticias.sql), no hay formulario publico que la alimente, por eso no
-- existe columna `verificado` ni policy de insert.

create table if not exists public.noticias (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  titulo            text not null,
  resumen           text not null,
  fecha_publicacion timestamptz not null,
  ciudad            text,
  fuente_nombre     text not null,
  fuente_url        text not null,
  confianza         text not null default 'media'
                      check (confianza in ('alta', 'media', 'baja'))
);

alter table public.noticias enable row level security;

create policy "noticias_public_select"
  on public.noticias for select
  to anon, authenticated
  using (true);

-- Sin policy de insert/update/delete: RLS deniega esas operaciones para
-- anon/authenticated. El contenido se administra desde el Table Editor.

-- Requerido para que `api/sync-informacion.ts` pueda hacer upsert
-- (onConflict: fuente_nombre,titulo) sin crear filas duplicadas cada dia.
create unique index if not exists noticias_fuente_titulo_uidx
  on public.noticias (fuente_nombre, titulo);

-- Servicios de ayuda ---------------------------------------------------------
-- Igual que noticias: contactos/servicios de emergencia curados a mano
-- (ver seed_servicios_ayuda.sql), sin insert publico.

create table if not exists public.servicios_ayuda (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  nombre         text not null,
  categoria      text not null
                   check (categoria in (
                     'emergencia',
                     'medico',
                     'psicosocial',
                     'legal',
                     'refugio',
                     'otros'
                   )),
  descripcion    text not null,
  direccion      text,
  telefono       text,
  whatsapp       text,
  email          text,
  ciudad         text,
  fuente_nombre  text not null,
  fuente_url     text not null,
  confianza      text not null default 'media'
                   check (confianza in ('alta', 'media', 'baja'))
);

alter table public.servicios_ayuda enable row level security;

create policy "servicios_ayuda_public_select"
  on public.servicios_ayuda for select
  to anon, authenticated
  using (true);

-- Requerido para que `api/sync-informacion.ts` pueda hacer upsert
-- (onConflict: fuente_nombre,nombre) sin crear filas duplicadas cada dia.
create unique index if not exists servicios_ayuda_fuente_nombre_uidx
  on public.servicios_ayuda (fuente_nombre, nombre);
