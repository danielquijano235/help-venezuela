import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useCentros } from '../hooks/useCentros';
import { FilterBar } from '../components/FilterBar';
import { CenterCard } from '../components/CenterCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ActionCards } from '../components/ActionCards';
import { ESTADOS } from '../data/constants';
import type { Estado, TipoDonacion } from '../types/centro';

export function ListingPage() {
  const { centros, loading, error, usingFallback, retry } = useCentros();
  const directoryRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState<Estado | ''>(() => {
    const estadoParam = searchParams.get('estado');
    return ESTADOS.some((e) => e.value === estadoParam) ? (estadoParam as Estado) : '';
  });
  const [hadEstadoParam] = useState(() => Boolean(searchParams.get('estado')));
  const [soloVerificados, setSoloVerificados] = useState(false);
  const [tiposSeleccionados, setTiposSeleccionados] = useState<TipoDonacion[]>([]);
  const [query, setQuery] = useState('');

  function toggleTipo(tipo: TipoDonacion) {
    setTiposSeleccionados((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  }

  function clearFilters() {
    setCiudad('');
    setEstado('');
    setSoloVerificados(false);
    setTiposSeleccionados([]);
    setQuery('');
  }

  const centrosFiltrados = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return centros.filter((centro) => {
      if (ciudad && centro.ciudad !== ciudad) return false;
      if (estado && centro.estado !== estado) return false;
      if (soloVerificados && !centro.verificado) return false;

      if (
        tiposSeleccionados.length > 0 &&
        !tiposSeleccionados.every((tipo) => centro.tipos_donacion.includes(tipo))
      ) {
        return false;
      }

      if (normalizedQuery) {
        const haystack =
          `${centro.nombre} ${centro.organizacion ?? ''} ${centro.direccion} ${centro.ciudad} ${centro.fuente_nombre ?? ''}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [centros, ciudad, estado, soloVerificados, tiposSeleccionados, query]);

  const urgentCount = useMemo(
    () => centros.filter((centro) => centro.estado === 'urgente').length,
    [centros]
  );
  const verifiedCount = useMemo(
    () => centros.filter((centro) => centro.verificado).length,
    [centros]
  );
  const cityCount = useMemo(() => new Set(centros.map((centro) => centro.ciudad)).size, [centros]);

  function scrollToDirectory() {
    window.requestAnimationFrame(() => {
      directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  useEffect(() => {
    if (hadEstadoParam) {
      scrollToDirectory();
    }
  }, [hadEstadoParam]);

  function showAllCenters() {
    clearFilters();
    scrollToDirectory();
  }

  function selectDonation(tipo: TipoDonacion) {
    setEstado('');
    setSoloVerificados(false);
    setTiposSeleccionados([tipo]);
    setQuery('');
    scrollToDirectory();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <ActionCards
        centrosCount={centros.length}
        urgentCount={urgentCount}
        verifiedCount={verifiedCount}
        cityCount={cityCount}
        onShowAll={showAllCenters}
        onSelectDonation={selectDonation}
      />

      <section
        ref={directoryRef}
        className="scroll-mt-6 rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-sm sm:p-6"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-signal">
              Directorio
            </p>
            <h2 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-ink">
              Centros de acopio en Colombia
            </h2>
            <p className="mt-2 text-ink/70">
              Encuentra dónde llevar donaciones para ayudar a Venezuela. {centros.length}{' '}
              {centros.length === 1 ? 'centro cargado' : 'centros cargados'}.
            </p>
          </div>

          <div className="rounded-lg border border-ink/10 bg-paper-card px-3 py-2 text-sm text-ink/70">
            <span className="font-mono text-lg font-semibold text-ink">{centrosFiltrados.length}</span>{' '}
            {centrosFiltrados.length === 1 ? 'centro encontrado' : 'centros encontrados'}
          </div>
        </div>

        <FilterBar
          ciudad={ciudad}
          onCiudadChange={setCiudad}
          estado={estado}
          onEstadoChange={setEstado}
          soloVerificados={soloVerificados}
          onSoloVerificadosChange={setSoloVerificados}
          tiposSeleccionados={tiposSeleccionados}
          onToggleTipo={toggleTipo}
          query={query}
          onQueryChange={setQuery}
          onClearFilters={clearFilters}
        />

        <div className="mt-6">
          {loading && <LoadingSpinner />}

          {!loading && error && usingFallback && (
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-flag/40 bg-flag/10 p-4 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag-dark" />
                <span>
                  No pudimos conectar con Supabase. Mostramos datos locales de emergencia mientras
                  vuelve la conexión.
                </span>
              </p>
              <button
                type="button"
                onClick={retry}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink/40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          )}

          {!loading && error && !usingFallback && (
            <p className="rounded-lg border border-signal/30 bg-signal/10 p-4 text-sm text-signal-dark">
              No se pudieron cargar los centros de acopio: {error}
            </p>
          )}

          {!loading && centrosFiltrados.length === 0 && <EmptyState />}

          {!loading && centrosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {centrosFiltrados.map((centro) => (
                <CenterCard key={centro.id} centro={centro} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
