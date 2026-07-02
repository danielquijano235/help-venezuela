import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/ayuda', label: 'Ayuda' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/noticias', label: 'Noticias' },
];

export function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[auto_1fr] md:items-center md:gap-x-6 lg:grid-cols-[auto_minmax(12rem,1fr)_auto]">
        <NavLink to="/" end className="w-fit">
          <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-ink">
            Help<span className="text-signal">Venezuela</span>
          </span>
        </NavLink>

        <div className="flex items-center justify-between gap-3 border-y border-ink/15 py-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink/55 sm:w-fit sm:justify-start sm:border-y-0 sm:py-0 md:justify-self-end lg:justify-self-center">
          <span className="whitespace-nowrap">Red de acopio</span>
          <span className="h-1 w-1 flex-none rounded-full bg-signal" aria-hidden="true" />
          <span className="whitespace-nowrap">Colombia</span>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-4 gap-y-2 md:col-span-2 md:justify-end lg:col-span-1"
          aria-label="Navegacion principal"
        >
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
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="whitespace-nowrap">Agregar centro</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
