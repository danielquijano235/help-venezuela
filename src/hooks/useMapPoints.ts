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

    return [...centroPoints, ...servicioPoints];
  }, [centros, servicios]);

  return {
    points,
    loading: loadingCentros || loadingServicios,
    error: errorCentros ?? errorServicios,
    usingFallback: fallbackCentros || fallbackServicios,
  };
}
