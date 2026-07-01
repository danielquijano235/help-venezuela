-- HelpVenezuela: actualizacion para datos importados por scraper.
-- Ejecutar una vez en Supabase si la tabla ya existia antes de estos campos.

alter table public.centros
  add column if not exists fuente_nombre text,
  add column if not exists fuente_url text,
  add column if not exists external_id text,
  add column if not exists ultima_revision timestamptz,
  add column if not exists ultima_vista timestamptz,
  add column if not exists confianza text not null default 'media';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'centros_confianza_check'
  ) then
    alter table public.centros
      add constraint centros_confianza_check
      check (confianza in ('alta', 'media', 'baja'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'centros_tipos_donacion_check'
  ) then
    alter table public.centros
      add constraint centros_tipos_donacion_check
      check (tipos_donacion <@ array[
        'medicina',
        'agua',
        'comida',
        'panales',
        'higiene',
        'ropa',
        'mascotas',
        'otros'
      ]::text[]);
  end if;
end
$$;

create unique index if not exists centros_fuente_external_id_uidx
  on public.centros (fuente_nombre, external_id);
