import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-ink">
            Help<span className="text-signal">Venezuela</span>
          </span>
          <span className="hidden font-mono text-[0.65rem] uppercase tracking-widest text-ink/50 sm:inline">
            Red de acopio · Colombia
          </span>
        </Link>
        <Link
          to="/agregar"
          className="flex items-center gap-1.5 border-2 border-ink bg-ink px-3 py-2 font-mono text-xs font-medium uppercase tracking-wide text-paper transition-colors hover:bg-signal hover:border-signal"
        >
          <Plus className="h-4 w-4" />
          Agregar centro
        </Link>
      </div>
    </header>
  );
}
