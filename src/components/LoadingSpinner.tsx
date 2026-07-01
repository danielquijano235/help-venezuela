import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = 'Cargando centros de acopio...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink/50">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}
