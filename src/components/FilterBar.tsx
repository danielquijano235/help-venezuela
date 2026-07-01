import { CIUDADES, ESTADOS, TIPOS_DONACION } from '../data/constants';
import { SearchBox } from './SearchBox';
import type { Estado, TipoDonacion } from '../types/centro';

interface FilterBarProps {
  ciudad: string;
  onCiudadChange: (ciudad: string) => void;
  estado: Estado | '';
  onEstadoChange: (estado: Estado | '') => void;
  soloVerificados: boolean;
  onSoloVerificadosChange: (soloVerificados: boolean) => void;
  tiposSeleccionados: TipoDonacion[];
  onToggleTipo: (tipo: TipoDonacion) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  ciudad,
  onCiudadChange,
  estado,
  onEstadoChange,
  soloVerificados,
  onSoloVerificadosChange,
  tiposSeleccionados,
  onToggleTipo,
  query,
  onQueryChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(ciudad || estado || soloVerificados || tiposSeleccionados.length || query);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink/15 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-56">
          <select
            value={ciudad}
            onChange={(e) => onCiudadChange(e.target.value)}
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          >
            <option value="">Todas las ciudades</option>
            {CIUDADES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <SearchBox value={query} onChange={onQueryChange} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-4">
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-ink/20 bg-white px-3 text-sm text-ink/75 transition-colors hover:border-moss/50">
          <input
            type="checkbox"
            checked={soloVerificados}
            onChange={(event) => onSoloVerificadosChange(event.target.checked)}
            className="h-4 w-4 accent-moss"
          />
          Solo verificados
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="min-h-9 rounded-full border border-ink/20 px-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink/65 transition-colors hover:border-ink/50 hover:text-ink"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEstadoChange('')}
          className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide transition-colors ${
            estado === ''
              ? 'border-ink bg-ink text-paper'
              : 'border-ink/20 bg-white text-ink/70 hover:border-ink/40'
          }`}
        >
          Todos los estados
        </button>
        {ESTADOS.map(({ value, label }) => {
          const active = estado === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onEstadoChange(value)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide transition-colors ${
                active
                  ? 'border-signal bg-signal text-paper'
                  : 'border-ink/20 bg-white text-ink/70 hover:border-signal/50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {TIPOS_DONACION.map(({ value, label, icon: Icon }) => {
          const active = tiposSeleccionados.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggleTipo(value)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? 'border-route bg-route text-paper'
                  : 'border-ink/20 bg-white text-ink/70 hover:border-route/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
