import { useMemo } from 'react';
import { useCentrosVenezuela } from './useCentrosVenezuela';
import { useServiciosAyuda } from './useServiciosAyuda';
import type { MapPoint } from '../types/mapPoint';

interface UseMapPointsResult {
  points: MapPoint[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
}

// Muchos centros solo tienen ciudad (sin direccion exacta), asi que Nominatim
// los geocodifica todos al mismo punto — sin esto, N marcadores quedarian
// apilados en una sola coordenada y solo se veria uno. Los separamos en un
// pequeno circulo alrededor del punto original para que cada uno sea visible.
function jitterOverlappingPoints(points: MapPoint[]): MapPoint[] {
  const groups = new Map<string, MapPoint[]>();
  for (const point of points) {
    const key = `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
    const group = groups.get(key);
    if (group) group.push(point);
    else groups.set(key, [point]);
  }

  const RADIUS_DEGREES = 0.02;

  return Array.from(groups.values()).flatMap((group) => {
    if (group.length === 1) return group;
    return group.map((point, index) => {
      const angle = (2 * Math.PI * index) / group.length;
      return {
        ...point,
        lat: point.lat + RADIUS_DEGREES * Math.sin(angle),
        lng: point.lng + RADIUS_DEGREES * Math.cos(angle),
      };
    });
  });
}

// Las coordenadas se geocodifican una vez del lado del servidor (cron en
// api/scrape-centros.ts / api/sync-informacion.ts) y quedan guardadas en
// Supabase — este hook solo filtra los que ya tienen lat/lng. Hacerlo en el
// navegador de cada visitante no es viable: Nominatim bloquea por
// CORS/rate-limit ese patron de uso casi de inmediato.
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
    const centroPoints: MapPoint[] = centros
      .filter((centro) => centro.lat != null && centro.lng != null)
      .map((centro) => ({ id: centro.id, kind: 'centro', lat: centro.lat as number, lng: centro.lng as number, data: centro }));

    const servicioPoints: MapPoint[] = servicios
      .filter((servicio) => servicio.lat != null && servicio.lng != null)
      .map((servicio) => ({
        id: servicio.id,
        kind: 'servicio',
        lat: servicio.lat as number,
        lng: servicio.lng as number,
        data: servicio,
      }));

    return jitterOverlappingPoints([...centroPoints, ...servicioPoints]);
  }, [centros, servicios]);

  return {
    points,
    loading: loadingCentros || loadingServicios,
    error: errorCentros ?? errorServicios,
    usingFallback: fallbackCentros || fallbackServicios,
  };
}
