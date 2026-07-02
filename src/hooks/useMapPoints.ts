import { useEffect, useRef, useState } from 'react';
import { useCentrosVenezuela } from './useCentrosVenezuela';
import { useServiciosAyuda } from './useServiciosAyuda';
import { geocodeAddress } from '../lib/geocode';
import type { MapPoint } from '../types/mapPoint';
import type { Centro } from '../types/centro';
import type { ServicioAyuda } from '../types/servicioAyuda';

interface UseMapPointsResult {
  points: MapPoint[];
  loading: boolean;
  geocoding: boolean;
  progress: { done: number; total: number };
  error: string | null;
  usingFallback: boolean;
}

type Task =
  | { kind: 'centro'; item: Centro }
  | { kind: 'servicio'; item: ServicioAyuda & { direccion: string } };

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

  const [points, setPoints] = useState<MapPoint[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [geocoding, setGeocoding] = useState(false);
  const requestId = useRef(0);

  const loading = loadingCentros || loadingServicios;

  useEffect(() => {
    if (loading) return;

    const currentRequest = ++requestId.current;

    const tasks: Task[] = [
      ...centros.map((item): Task => ({ kind: 'centro', item })),
      ...servicios
        .filter((s): s is ServicioAyuda & { direccion: string } => Boolean(s.direccion))
        .map((item): Task => ({ kind: 'servicio', item })),
    ];

    setPoints([]);
    setProgress({ done: 0, total: tasks.length });
    setGeocoding(tasks.length > 0);

    if (tasks.length === 0) return;

    let done = 0;

    Promise.all(
      tasks.map(async (task) => {
        const coords =
          task.kind === 'centro'
            ? await geocodeAddress(task.item.direccion, task.item.ciudad, task.item.pais)
            : await geocodeAddress(task.item.direccion, task.item.ciudad ?? '', 'Venezuela');

        if (requestId.current !== currentRequest) return;

        done += 1;
        setProgress({ done, total: tasks.length });

        if (!coords) return;

        setPoints((prev) => [
          ...prev,
          task.kind === 'centro'
            ? { id: task.item.id, kind: 'centro', lat: coords.lat, lng: coords.lng, data: task.item }
            : { id: task.item.id, kind: 'servicio', lat: coords.lat, lng: coords.lng, data: task.item },
        ]);
      }),
    ).then(() => {
      if (requestId.current === currentRequest) setGeocoding(false);
    });
  }, [loading, centros, servicios]);

  return {
    points,
    loading,
    geocoding,
    progress,
    error: errorCentros ?? errorServicios,
    usingFallback: fallbackCentros || fallbackServicios,
  };
}
