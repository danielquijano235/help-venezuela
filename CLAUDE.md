# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # dev server (Vite)
npm run build     # tsc -b && vite build — type-checks before bundling
npm run lint      # oxlint (not ESLint — see .oxlintrc.json)
npm run preview   # serve the production build locally
```

No test suite exists yet. There is no `npm test` script.

## Architecture

HelpVenezuela is primarily a static React + TypeScript SPA. The public app reads and
submits data directly through Supabase, and there are two server-side Vercel Functions —
`api/scrape-centros.ts` and `api/sync-informacion.ts` — both for scheduled data ingestion
only; do not add an Express/Flask/API layer. They share auth/config helpers from
`server/cronAuth.ts`, which deliberately lives **outside** `api/`: Vercel deploys every file
under `api/` as its own function, so a shared module has to sit in a sibling folder instead.

### Data model and security

`supabase/schema.sql` defines the `public.centros` table and RLS policies. This file is
the source of truth and is applied manually in the Supabase SQL editor. If an existing DB
needs the scraper metadata fields, run `supabase/upgrade_scraper_metadata.sql` once.

The Supabase anon key ships inside the client bundle by design. All public access control
is enforced by Postgres RLS policies:

- Public `select` is allowed on all rows, including unverified ones.
- Public `insert` is allowed but `WITH CHECK (verificado = false)`.
- No `update`/`delete` policy exists for public clients.
- The scraper uses `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never expose it with a
  `VITE_` prefix.

Unverified centers are intentionally shown in the public listing and tagged with a
vigencia warning. This is a product decision for emergency-response info.

`src/types/centro.ts` and `supabase/schema.sql` must stay in sync for the `Estado`,
`TipoDonacion`, and `confianza` check-constraint values. `src/data/constants.ts` mirrors
`Estado` and `TipoDonacion` as UI-facing arrays (labels/icons for filters and the add-center
form) — `confianza` has no such array since it isn't rendered in the UI yet.

`schema.sql` also defines `public.noticias` and `public.servicios_ayuda` — editorial content
(news and emergency/help contacts) curated by hand, kept in sync by `api/sync-informacion.ts`
(see Data flow below). Unlike `centros`, neither table has an `insert` RLS policy at all
(public clients can only `select`), since there's no public submission form feeding them —
everything in these two tables is team-curated, so there's no `verificado` column either.
`src/types/noticia.ts` and `src/types/servicioAyuda.ts` mirror their check-constraint values
(`confianza`, `categoria`). Both tables have a unique index (`fuente_nombre` + `titulo`/
`nombre`) that exists solely so the cron's `upsert` doesn't create duplicate rows — there's
no scraper-style external ID for this content.

`supabase/seed_noticias.sql` / `supabase/seed_servicios_ayuda.sql` were the one-time initial
load (run manually, same convention as `seed.sql`); `api/sync-informacion.ts` is what keeps
them current going forward — see Data flow.

### Data flow

`src/hooks/useCentros.ts` fetches the full `centros` table once on mount. All filtering
still happens client-side in `ListingPage`.

If Supabase is unavailable or missing env vars, `useCentros` falls back to
`src/data/fallbackCentros.ts` so the directory is never empty solely because the network is
down.

`api/scrape-centros.ts` is called by Vercel Cron once a day (`vercel.json`) — the Hobby
plan only allows daily cron schedules, so this isn't every 6h despite the original design
intent. It fetches
public sources, normalizes centers, and upserts into Supabase by `(fuente_nombre,
external_id)`. Imported rows stay `verificado = false` until manual moderation. The route
checks `Authorization: Bearer <secret>` against `SCRAPER_CRON_SECRET` (falling back to
`CRON_SECRET` if unset) whenever one of those env vars is present.

Two kinds of sources feed `centros`: a live HTML scrape of `redporvenezuela.com/centros`
(`parseRedPorVenezuela`, regex-based — brittle if that site's markup changes), and a set of
hand-curated `get<Ciudad>SeedCentros()` functions (one per city: Bogotá, Medellín,
Bucaramanga, Cúcuta, Barranquilla, Cali), each citing one real news-article URL as
`fuente_url`. These seeds exist because most city-level donation points are reported once
in a news article (prose, no stable structure to scrape repeatedly) rather than published
on a live directory — so the "scrape" for those cities is a one-time manual read of the
article into a typed literal, re-upserted (with a fresh `ultima_vista`) every cron run. To
add another city, add a new `get<Ciudad>SeedCentros()` function following the same shape
and append it to the `centros` array in the handler.

`src/lib/maps.ts` builds a Google Maps search URL from plain address text. There is no
geocoding API integration.

`src/hooks/useNoticias.ts` and `src/hooks/useServiciosAyuda.ts` mirror `useCentros.ts`'s
shape exactly (fetch on mount, loading/error state, local fallback) — deliberately not
abstracted into a shared generic hook, consistent with the rest of the codebase not
abstracting this pattern either.

`api/sync-informacion.ts` is called by Vercel Cron once a day (`vercel.json`, offset from
the centros cron). Unlike `scrape-centros.ts`, there's no live source to scrape — news and
help-service contacts are reported once in prose news articles, not a structured directory
— so this function's `getNoticias()`/`getServiciosAyuda()` are hand-maintained arrays (same
idea as `get<Ciudad>SeedCentros()`), each item citing a real source. "Adding more" means
editing those two arrays and pushing; the daily cron re-upserts them (`onConflict:
fuente_nombre,titulo` / `fuente_nombre,nombre`) so nobody needs to touch the Supabase SQL
editor again after the initial seed.

### Routing

Four SPA routes are wired in `src/App.tsx`: `/` (`ListingPage`), `/agregar`
(`AddCenterPage`), `/ayuda` (`AyudaPage` — emergency/help services from
`servicios_ayuda`), `/noticias` (`NoticiasPage` — news from `noticias`), plus a catch-all
`*` route rendering `NotFoundPage`. `vercel.json` and `public/_redirects` rewrite SPA
routes to `index.html`; Vercel API routes still live under `/api/*`.

The 4 homepage "puertas" in `src/components/ActionCards.tsx` each resolve to one real
destination now: Puerta 01 ("Necesito ayuda") → `/ayuda` (plus a link straight to
`/?estado=urgente` for the urgent-centros shortcut), Puerta 02 ("Quiero ayudar") → the
directory on `/`, Puerta 03 ("Quiero entender") → `/noticias`, Puerta 04 → `/agregar`.
`ListingPage` reads `?estado=` from the URL on mount (via `useSearchParams`) to support
that deep link from `/ayuda`.

### Styling

Tailwind CSS v4 is configured via `@tailwindcss/vite` in `vite.config.ts`. There is no
`tailwind.config.js` or `postcss.config.js`. Tailwind is enabled with `@import
"tailwindcss";` at the top of `src/index.css`.

### Environment variables

Client:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server/cron only:

```bash
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

The app can render fallback data without Supabase env vars, but Supabase-backed fetching,
submissions, and the scraper require the appropriate variables.
