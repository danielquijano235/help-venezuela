import { useCallback, useEffect, useState } from 'react';
import { FALLBACK_SERVICIOS_AYUDA } from '../data/fallbackServiciosAyuda';
import { supabase, supabaseConfigError } from '../lib/supabaseClient';
import type { ServicioAyuda } from '../types/servicioAyuda';

interface UseServiciosAyudaResult {
  servicios: ServicioAyuda[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
  retry: () => void;
}

export function useServiciosAyuda(): UseServiciosAyudaResult {
  const [servicios, setServicios] = useState<ServicioAyuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchServicios() {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      if (!supabase) {
        setServicios(FALLBACK_SERVICIOS_AYUDA);
        setError(supabaseConfigError);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('servicios_ayuda')
        .select('*')
        .order('categoria', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setServicios(FALLBACK_SERVICIOS_AYUDA);
        setUsingFallback(true);
      } else {
        setServicios(data ?? []);
      }
      setLoading(false);
    }

    fetchServicios();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { servicios, loading, error, usingFallback, retry };
}
