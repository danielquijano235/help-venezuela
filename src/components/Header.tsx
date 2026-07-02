import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/ayuda', label: 'Ayuda' },
  { to: '/noticias', label: 'Noticias' },
];

export function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <NavLink to="/" end className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-ink">
            Help<span className="text-signal">Venezuela</span>
          </span>
          <span className="hidden font-mono text-[0.65rem] uppercase tracking-widest text-ink/50 sm:inline">
            Red de acopio · Colombia
          </span>
        </NavLink>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `font-mono text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route ${
                  isActive ? 'text-signal' : 'text-ink/60 hover:text-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <NavLink
            to="/agregar"
            className={({ isActive }) =>
              `flex items-center gap-1.5 border-2 px-3 py-2 font-mono text-xs font-medium uppercase tracking-wide text-paper transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route ${
                isActive ? 'border-signal bg-signal' : 'border-ink bg-ink hover:border-signal hover:bg-signal'
              }`
            }
          >
            <Plus className="h-4 w-4" />
            Agregar centro
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
