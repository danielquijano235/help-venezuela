import { ESTADOS } from '../data/constants';
import type { Estado } from '../types/centro';

interface StatusBadgeProps {
  estado: Estado;
  verificado: boolean;
}

export function StatusBadge({ estado, verificado }: StatusBadgeProps) {
  const config = ESTADOS.find((e) => e.value === estado);

  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className={`rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide ${config?.className ?? ''}`}
      >
        {config?.label ?? estado}
      </span>
      {!verificado && (
        <span className="rounded-full border border-flag bg-flag/15 px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-flag-dark">
          Verificar vigencia
        </span>
      )}
    </div>
  );
}
