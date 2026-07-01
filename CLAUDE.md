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
submits data directly through Supabase, and there is one server-side Vercel Function:
`api/scrape-centros.ts`. That function is for scheduled data ingestion only; do not add an
Express/Flask/API layer.

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

### Data flow

`src/hooks/useCentros.ts` fetches the full `centros` table once on mount. All filtering
still happens client-side in `ListingPage`.

If Supabase is unavailable or missing env vars, `useCentros` falls back to
`src/data/fallbackCentros.ts` so the directory is never empty solely because the network is
down.

`api/scrape-centros.ts` is called by Vercel Cron every 6 hours (`vercel.json`). It fetches
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

### Routing

Two SPA routes are wired in `src/App.tsx`: `/` (`ListingPage`) and `/agregar`
(`AddCenterPage`), plus a catch-all `*` route rendering `NotFoundPage`. `vercel.json` and
`public/_redirects` rewrite SPA routes to `index.html`; Vercel API routes still live under
`/api/*`.

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
