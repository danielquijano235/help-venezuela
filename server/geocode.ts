// Lives outside `api/` on purpose, same reason as cronAuth.ts: shared code
// between the two cron functions can't sit inside `api/` (Vercel deploys
// every file there as its own isolated function).
//
// Geocoding runs here (server-side, once a day in the cron) instead of in
// the browser: calling Nominatim directly from every visitor's browser hits
// their CORS/rate-limit policy almost immediately in practice, so the map
// would render with zero points for real users. One server doing it once
// and storing lat/lng in Supabase avoids that entirely.

export interface LatLng {
  lat: number;
  lng: number;
}

const NOMINATIM_DELAY_MS = 1100;
const cache = new Map<string, LatLng | null>();

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function fetchFromNominatim(query: string): Promise<LatLng | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      // Nominatim's usage policy requires an identifying User-Agent for
      // server-side clients (browsers get a pass via Referer, but a cron
      // function has neither by default).
      'User-Agent': 'HelpVenezuelaBot/1.0 (+https://helpvenezuela.local)',
    },
  });

  if (!response.ok) return null;

  const results = (await response.json()) as Array<{ lat: string; lon: string }>;
  const first = results[0];
  if (!first) return null;

  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

let queue: Promise<unknown> = Promise.resolve();

function geocodeQuery(query: string): Promise<LatLng | null> {
  const key = normalizeQuery(query);
  if (cache.has(key)) return Promise.resolve(cache.get(key) ?? null);

  const result = queue.then(async () => {
    const value = await fetchFromNominatim(key).catch(() => null);
    cache.set(key, value);
    return value;
  });

  queue = result
    .catch(() => undefined)
    .then(() => new Promise((resolve) => setTimeout(resolve, NOMINATIM_DELAY_MS)));

  return result;
}

// Muchas direcciones scrapeadas son placeholders ("Dirección por confirmar")
// o prosa de articulo, no direcciones reales, asi que Nominatim no las
// encuentra. Si la direccion completa falla, cae a solo ciudad+pais para
// al menos ubicar el punto en la ciudad correcta en vez de perderlo.
export async function geocodeAddress(
  direccion: string,
  ciudad: string,
  pais: string
): Promise<LatLng | null> {
  const preciso = await geocodeQuery(`${direccion}, ${ciudad}, ${pais}`);
  if (preciso) return preciso;

  if (!ciudad) return null;
  return geocodeQuery(`${ciudad}, ${pais}`);
}
