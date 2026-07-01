import { TIPOS_DONACION } from '../data/constants';
import type { TipoDonacion } from '../types/centro';

interface DonationTypeTagProps {
  tipo: TipoDonacion;
}

export function DonationTypeTag({ tipo }: DonationTypeTagProps) {
  const config = TIPOS_DONACION.find((t) => t.value === tipo);
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span className="flex items-center gap-1 rounded-full border border-ink/15 bg-ink/5 px-2 py-0.5 text-xs text-ink/70">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
