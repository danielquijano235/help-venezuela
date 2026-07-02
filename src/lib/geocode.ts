export interface LatLng {
  lat: number;
  lng: number;
}

const CACHE_PREFIX = 'hv:geocode:';
const NOMINATIM_DELAY_MS = 1100;

let queue: Promise<unknown> = Promise.resolve();

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function readCache(key: string): LatLng | null | undefined {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw === null) return undefined;
    return JSON.parse(raw) as LatLng | null;
  } catch {
    return undefined;
  }
}

function writeCache(key: string, value: LatLng | null) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage puede fallar (modo privado, cuota llena) — el geocoding
    // sigue funcionando, solo sin cache.
  }
}

async function fetchFromNominatim(query: string): Promise<LatLng | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) return null;

  const results = (await response.json()) as Array<{ lat: string; lon: string }>;
  const first = results[0];
  if (!first) return null;

  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

// Nominatim's usage policy caps unauthenticated clients at 1 request/second,
// so every real lookup is chained onto a shared queue with a fixed delay
// between them — cached hits skip the queue entirely.
export function geocodeQuery(query: string): Promise<LatLng | null> {
  const key = normalizeQuery(query);
  const cached = readCache(key);
  if (cached !== undefined) return Promise.resolve(cached);

  const result = queue.then(async () => {
    const value = await fetchFromNominatim(key).catch(() => null);
    writeCache(key, value);
    return value;
  });

  queue = result
    .catch(() => undefined)
    .then(() => new Promise((resolve) => setTimeout(resolve, NOMINATIM_DELAY_MS)));

  return result;
}

// Muchas direcciones scrapeadas son placeholders ("Dirección por confirmar")
// o prosa de artículo, no direcciones reales, así que Nominatim no las
// encuentra. Si la dirección completa falla, caemos a solo ciudad+país para
// al menos ubicar el punto en la ciudad correcta en vez de perderlo.
export async function geocodeAddress(direccion: string, ciudad: string, pais: string): Promise<LatLng | null> {
  const preciso = await geocodeQuery(`${direccion}, ${ciudad}, ${pais}`);
  if (preciso) return preciso;

  if (!ciudad) return null;
  return geocodeQuery(`${ciudad}, ${pais}`);
}
