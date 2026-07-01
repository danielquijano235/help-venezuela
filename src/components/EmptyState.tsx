import { SearchX } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-ink/50">
      <SearchX className="h-8 w-8" />
      <p className="font-medium text-ink/70">No encontramos centros con esos filtros.</p>
      <p className="text-sm">Intenta cambiar la ciudad, el tipo de donación o la búsqueda.</p>
    </div>
  );
}
