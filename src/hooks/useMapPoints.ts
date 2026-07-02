import { useMemo } from 'react';
import { useCentrosVenezuela } from './useCentrosVenezuela';
import { useServiciosAyuda } from './useServiciosAyuda';
import type { Centro } from '../types/centro';
import type { MapPoint } from '../types/mapPoint';

interface UseMapPointsResult {
  points: MapPoint[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
}

// El scrape de redporvenezuela.com etiqueta como pais=Venezuela varios puntos
// que en realidad son de la diáspora (Madrid, Orlando, Ankara, Doral, etc.).
// No tienen una ubicación real en Venezuela, así que se excluyen del mapa.
const FOREIGN_LOCATION_HINTS = [
  'ankara',
  'barbusse',
  'carolina del norte',
  'carrer de',
  'doral',
  'jacksonville',
  'madrid',
  'mexico',
  'orlando',
  'rue ',
  'talca',
];

function normalize(value: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isForeignCentro(centro: Centro): boolean {
  const haystack = `${normalize(centro.nombre)} ${normalize(centro.direccion)}`;
  return FOREIGN_LOCATION_HINTS.some((hint) => haystack.includes(hint));
}

function isMappableCentro(centro: Centro): boolean {
  return centro.lat != null && centro.lng != null && !isForeignCentro(centro);
}

// Casi todos los centros solo se geocodifican a nivel de ciudad (no traen una
// dirección exacta), por lo que dibujar un pin por centro los apilaba a todos
// en el mismo punto. En vez de inventar posiciones se agrupa un pin por ciudad
// con la lista de centros adentro.
function groupCentrosByCity(centros: Centro[]): MapPoint[] {
  const cities = new Map<string, Centro[]>();
  for (const centro of centros) {
    const key = normalize(centro.ciudad) || 'sin-ciudad';
    const group = cities.get(key);
    if (group) group.push(centro);
    else cities.set(key, [centro]);
  }

  const points: MapPoint[] = [];
  for (const [key, group] of cities) {
    // El scrape repite el mismo centro varias veces; se dejan únicos por nombre.
    const seen = new Set<string>();
    const unique = group.filter((centro) => {
      const name = normalize(centro.nombre);
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });

    const lat = unique.reduce((sum, c) => sum + (c.lat as number), 0) / unique.length;
    const lng = unique.reduce((sum, c) => sum + (c.lng as number), 0) / unique.length;

    points.push({
      kind: 'ciudad',
      id: `ciudad-${key}`,
      lat,
      lng,
      ciudad: unique[0].ciudad,
      centros: unique,
    });
  }
  return points;
}

// Coordinates are geocoded once on the server cron and stored in Supabase.
export function useMapPoints(): UseMapPointsResult {
  const {
    centros,
    loading: loadingCentros,
    error: errorCentros,
    usingFallback: fallbackCentros,
  } = useCentrosVenezuela();
  const {
    servicios,
    loading: loadingServicios,
    error: errorServicios,
    usingFallback: fallbackServicios,
  } = useServiciosAyuda();

  const points = useMemo<MapPoint[]>(() => {
    const cityPoints = groupCentrosByCity(centros.filter(isMappableCentro));

    const servicioPoints: MapPoint[] = servicios
      .filter((servicio) => servicio.lat != null && servicio.lng != null)
      .map((servicio) => ({
        kind: 'servicio',
        id: servicio.id,
        lat: servicio.lat as number,
        lng: servicio.lng as number,
        data: servicio,
      }));

    return [...cityPoints, ...servicioPoints];
  }, [centros, servicios]);

  return {
    points,
    loading: loadingCentros || loadingServicios,
    error: errorCentros ?? errorServicios,
    usingFallback: fallbackCentros || fallbackServicios,
  };
}
