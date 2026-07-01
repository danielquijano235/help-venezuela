import { useCallback, useEffect, useState } from 'react';
import { FALLBACK_NOTICIAS } from '../data/fallbackNoticias';
import { supabase, supabaseConfigError } from '../lib/supabaseClient';
import type { Noticia } from '../types/noticia';

interface UseNoticiasResult {
  noticias: Noticia[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
  retry: () => void;
}

export function useNoticias(): UseNoticiasResult {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchNoticias() {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      if (!supabase) {
        setNoticias(FALLBACK_NOTICIAS);
        setError(supabaseConfigError);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('noticias')
        .select('*')
        .order('fecha_publicacion', { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setNoticias(FALLBACK_NOTICIAS);
        setUsingFallback(true);
      } else {
        setNoticias(data ?? []);
      }
      setLoading(false);
    }

    fetchNoticias();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { noticias, loading, error, usingFallback, retry };
}
