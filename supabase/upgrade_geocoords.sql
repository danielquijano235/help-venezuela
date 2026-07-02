-- HelpVenezuela: agrega coordenadas para el mapa (/mapa).
-- Ejecutar una vez en Supabase si las tablas `centros` / `servicios_ayuda`
-- ya existian antes de este campo. Quedan NULL hasta que el cron
-- (api/scrape-centros.ts / api/sync-informacion.ts) las geocodifique del
-- lado del servidor; el frontend simplemente omite los puntos sin
-- coordenadas todavia.

alter table public.centros
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.servicios_ayuda
  add column if not exists lat double precision,
  add column if not exists lng double precision;
