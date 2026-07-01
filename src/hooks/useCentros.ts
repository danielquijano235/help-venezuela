import { useCallback, useEffect, useState } from 'react';
import { FALLBACK_CENTROS } from '../data/fallbackCentros';
import { supabase, supabaseConfigError } from '../lib/supabaseClient';
import type { Centro } from '../types/centro';

interface UseCentrosResult {
  centros: Centro[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
  retry: () => void;
}

export function useCentros(): UseCentrosResult {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCentros() {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      if (!supabase) {
        setCentros(FALLBACK_CENTROS);
        setError(supabaseConfigError);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('centros')
        .select('*')
        .order('estado', { ascending: true })
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setCentros(FALLBACK_CENTROS);
        setUsingFallback(true);
      } else {
        setCentros(data ?? []);
      }
      setLoading(false);
    }

    fetchCentros();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { centros, loading, error, usingFallback, retry };
}
