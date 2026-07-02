# HelpVenezuela

Directorio de centros de acopio en Colombia para ayudar a Venezuela. Inspirado en la
seccion de centros de [redporvenezuela.com](https://redporvenezuela.com/centros), pero
enfocado en puntos de donacion dentro de Colombia.

Sitio React + TypeScript + Vite. El frontend lee datos desde Supabase y, si Supabase falla,
muestra un fallback local minimo para que el directorio no quede vacio.

## Funcionalidad

- Listado de centros de acopio con filtros por ciudad, estado, verificacion, tipo de donacion
  y busqueda de texto.
- Fuente visible por centro, fecha de ultima revision cuando existe y aviso de vigencia para
  datos no verificados.
- Boton "Como llegar" que abre la direccion del centro en Google Maps.
- Boton "Ver fuente" cuando el dato viene de una publicacion o fuente publica.
- Scraper server-side en `/api/scrape-centros`, programado con Vercel Cron una vez al dia
  (el plan gratuito de Vercel solo permite crons diarios).
- Formulario publico `/agregar` para sugerir nuevos centros. Los envios quedan como
  `verificado = false` hasta revision manual.
- `/ayuda`: servicios y contactos de emergencia reales (Cruz Roja, atencion psicosocial,
  etc.), con link directo a los centros urgentes del directorio.
- `/noticias`: noticias reales sobre los terremotos y la respuesta humanitaria, con fuente
  citada en cada nota.
- Noticias y servicios de ayuda tambien se mantienen al dia solos: `/api/sync-informacion`
  corre 1 vez al dia (Vercel Cron) y vuelve a subir el contenido curado.

## Requisitos

- Node.js 18+ y npm.
- Un proyecto de [Supabase](https://supabase.com/) (plan gratuito es suficiente).
- Para el scraper en produccion: `SUPABASE_SERVICE_ROLE_KEY` configurada solo en Vercel,
  nunca como variable `VITE_`.

## Setup

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en Supabase y ejecutar en el SQL Editor:

   - `supabase/schema.sql` para crear las tablas (`centros`, `noticias`, `servicios_ayuda`)
     y sus politicas de RLS.
   - `supabase/seed.sql` para cargar la primera tanda real conservadora de centros.
   - `supabase/seed_noticias.sql` y `supabase/seed_servicios_ayuda.sql` para cargar las
     noticias y los servicios de ayuda reales que alimentan `/noticias` y `/ayuda`.

   Si la tabla ya existia antes de los campos del scraper, ejecutar una vez:

   ```sql
   -- supabase/upgrade_scraper_metadata.sql
   ```

3. Copiar `.env.example` a `.env.local` y completar:

   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   CRON_SECRET=un-secreto-largo
   ```

4. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Datos reales actualizados

El navegador no hace scraping. El flujo es:

1. Vercel Cron llama `/api/scrape-centros` una vez al dia.
2. La funcion lee fuentes publicas: el directorio de Red por Venezuela, mas una semilla
   conservadora de puntos reportados por medios (El Tiempo, Vanguardia, La Opinion, El
   Heraldo, TuBarco Noticias) en Bogota, Medellin, Bucaramanga, Cucuta, Barranquilla y
   Cali. Agregar una ciudad nueva es agregar una funcion `get<Ciudad>SeedCentros()` en
   `api/scrape-centros.ts` citando la fuente real.
3. Normaliza ciudad, tipos de donacion, fuente, `external_id`, `ultima_revision` y
   `ultima_vista`.
4. Hace `upsert` en Supabase con `SUPABASE_SERVICE_ROLE_KEY`.

Para probar el scraper manualmente en Vercel:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://tu-dominio.vercel.app/api/scrape-centros
```

Los datos importados automaticamente quedan `verificado = false`; la verificacion sigue
siendo manual desde Supabase.

### Noticias y servicios de ayuda

A diferencia de los centros, no hay un directorio en vivo para scrapear (son notas de
prensa sueltas, no una fuente estructurada). `/api/sync-informacion` corre 1 vez al dia
(desfasado del cron de centros) y hace `upsert` de dos arrays mantenidos a mano en el
propio archivo (`getNoticias()` / `getServiciosAyuda()`), cada item citando una fuente real.

Para agregar mas contenido: edita esos arrays en `api/sync-informacion.ts` con datos reales
y su fuente, y haz push — el cron del dia siguiente los sube solo, sin tocar el SQL Editor
de Supabase otra vez. El `upsert` usa `(fuente_nombre, titulo)` para noticias y
`(fuente_nombre, nombre)` para servicios de ayuda, asi que no crea filas duplicadas.

Para probarlo manualmente:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://tu-dominio.vercel.app/api/sync-informacion
```

## Seguridad de datos (RLS)

La `anon key` de Supabase se incluye en el bundle del frontend por diseno. Toda la seguridad
real vive en las politicas de Row Level Security definidas en `supabase/schema.sql`:

- Lectura publica de todos los centros, incluyendo no verificados.
- Insercion publica permitida, pero forzando `verificado = false`.
- Sin politica de `UPDATE`/`DELETE` para el rol publico.

La moderacion se hace manualmente desde el Table Editor de Supabase cambiando `verificado`
a `true`.

Las tablas `noticias` y `servicios_ayuda` son de solo lectura publica: no tienen politica de
`insert` (ni de `update`/`delete`), asi que solo se administran a mano desde Supabase. No hay
formulario publico que las alimente.

## Deploy

- **Vercel**: configura `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` y `CRON_SECRET`. `vercel.json` incluye el rewrite del SPA y
  los crons de `/api/scrape-centros` y `/api/sync-informacion`.
- **Netlify**: sirve el SPA con `public/_redirects`, pero el cron/serverless scraper tendria
  que migrarse a Netlify Functions o a otro scheduler.

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de produccion (dist/)
npm run preview   # sirve el build de produccion localmente
npm run lint      # oxlint
```

## Fuera de alcance

- Geocoding real / mapa con pines.
- Scraping desde el navegador.
- Panel de administracion autenticado.
- Mitigacion completa de spam/abuso en el formulario publico.
- SSR/SEO.
