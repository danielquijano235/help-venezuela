import { AlertTriangle, CalendarClock, ExternalLink, RefreshCw } from 'lucide-react';
import { useNoticias } from '../hooks/useNoticias';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BackLink } from '../components/BackLink';

export function NoticiasPage() {
  const { noticias, loading, error, usingFallback, retry } = useNoticias();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <BackLink to="/" label="Volver al inicio" />
      <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-wider text-flag">
        Quiero entender
      </p>
      <h1 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-ink sm:text-4xl">
        Noticias e información real
      </h1>
      <p className="mt-2 text-ink/70">
        Lo que está pasando con los terremotos en Venezuela y la respuesta humanitaria, con
        fuente citada en cada nota.
      </p>

      {!loading && error && usingFallback && (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-flag/40 bg-flag/10 p-4 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag-dark" />
            <span>
              No pudimos conectar con Supabase. Mostramos noticias locales de emergencia
              mientras vuelve la conexión.
            </span>
          </p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {!loading && error && !usingFallback && (
        <p className="mt-6 rounded-lg border border-signal/30 bg-signal/10 p-4 text-sm text-signal-dark">
          No se pudieron cargar las noticias: {error}
        </p>
      )}

      {loading && <LoadingSpinner label="Cargando noticias..." />}

      {!loading && !error && noticias.length === 0 && (
        <p className="mt-6 py-16 text-center text-ink/50">Todavía no hay noticias cargadas.</p>
      )}

      {!loading && noticias.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((noticia) => (
            <article
              key={noticia.id}
              className="flex flex-col gap-2 rounded-xl border border-ink/15 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
                <span className="inline-flex items-center gap-1 rounded-full bg-flag/15 px-2 py-1 text-flag-dark">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDate(noticia.fecha_publicacion)}
                </span>
                {noticia.ciudad && (
                  <span className="rounded-full bg-route/10 px-2 py-1 font-medium text-route">
                    {noticia.ciudad}
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-ink">{noticia.titulo}</h2>
              <p className="line-clamp-3 text-sm text-ink/70">{noticia.resumen}</p>
              <a
                href={noticia.fuente_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex w-fit items-center gap-1 text-sm font-medium text-ink/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
              >
                <ExternalLink className="h-4 w-4" />
                Fuente: {noticia.fuente_nombre}
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
