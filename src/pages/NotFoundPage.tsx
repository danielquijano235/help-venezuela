import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink">
        Página no encontrada
      </h1>
      <p className="text-ink/70">La página que buscas no existe.</p>
      <Link to="/" className="font-medium text-signal hover:text-signal-dark">
        Volver al listado de centros
      </Link>
    </main>
  );
}
