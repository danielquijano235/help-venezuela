-- HelpVenezuela: agrega el pais del centro (Colombia/Venezuela).
-- Ejecutar una vez en Supabase si la tabla `centros` ya existia antes de
-- este campo. Filas existentes quedan en 'Colombia' (el default), que es
-- correcto: hasta ahora el sitio solo tenia centros en Colombia.

alter table public.centros
  add column if not exists pais text not null default 'Colombia';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'centros_pais_check'
  ) then
    alter table public.centros
      add constraint centros_pais_check
      check (pais in ('Colombia', 'Venezuela'));
  end if;
end
$$;
