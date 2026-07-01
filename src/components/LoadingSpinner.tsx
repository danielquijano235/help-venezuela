import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink/50">
      <Loader2 className="h-5 w-5 animate-spin" />
      Cargando centros de acopio...
    </div>
  );
}
