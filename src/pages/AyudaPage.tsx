import { AlertTriangle, ExternalLink, Mail, MapPin, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServiciosAyuda } from '../hooks/useServiciosAyuda';
import { useCentrosVenezuela } from '../hooks/useCentrosVenezuela';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CenterCard } from '../components/CenterCard';
import { BackLink } from '../components/BackLink';
import { CATEGORIAS_SERVICIO } from '../data/constants';
import { buildWhatsappUrl } from '../lib/maps';

export function AyudaPage() {
  const { servicios, loading, error, usingFallback, retry } = useServiciosAyuda();
  const {
    centros: centrosVenezuela,
    loading: loadingCentrosVenezuela,
    error: errorCentrosVenezuela,
  } = useCentrosVenezuela();

  const porCategoria = CATEGORIAS_SERVICIO.map((categoria) => ({
    ...categoria,
    servicios: servicios.filter((servicio) => servicio.categoria === categoria.value),
  })).filter((grupo) => grupo.servicios.length > 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <BackLink to="/" label="Volver al inicio" />
      <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-wider text-signal">
        Necesito ayuda
      </p>
      <h1 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-ink sm:text-4xl">
        Servicios y contactos de ayuda
      </h1>
      <p className="mt-2 text-ink/70">
        Líneas y puntos de atención reales para emergencias, salud mental y contacto con
        familiares.
      </p>

      <Link
        to="/?estado=urgente"
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-signal px-4 font-mono text-sm font-semibold uppercase tracking-wide text-paper hover:bg-signal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Ver centros de acopio urgentes
      </Link>

      {!loading && error && usingFallback && (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-flag/40 bg-flag/10 p-4 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag-dark" />
            <span>
              No pudimos conectar con Supabase. Mostramos servicios locales de emergencia
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
          No se pudieron cargar los servicios de ayuda: {error}
        </p>
      )}

      <section className="mt-8 flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
          Centros de acopio en Venezuela
        </h2>
        <p className="text-sm text-ink/70">
          Puntos dentro de Venezuela para recibir o llevar ayuda, tomados en vivo del
          directorio de Red por Venezuela.
        </p>

        {loadingCentrosVenezuela && <LoadingSpinner label="Cargando centros en Venezuela..." />}

        {!loadingCentrosVenezuela && !errorCentrosVenezuela && centrosVenezuela.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/50">
            Todavía no hay centros de Venezuela cargados.
          </p>
        )}

        {!loadingCentrosVenezuela && centrosVenezuela.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {centrosVenezuela.map((centro) => (
              <CenterCard key={centro.id} centro={centro} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-col gap-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
          Líneas y contactos de ayuda
        </h2>

        {loading && <LoadingSpinner label="Cargando servicios de ayuda..." />}

        {!loading && !error && servicios.length === 0 && (
          <p className="py-16 text-center text-ink/50">Todavía no hay servicios cargados.</p>
        )}

        {!loading &&
          porCategoria.map((grupo) => {
            const Icon = grupo.icon;
            return (
              <section key={grupo.value} className="flex flex-col gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-tight text-ink">
                  <Icon className="h-5 w-5 text-signal" />
                  {grupo.label}
                </h2>
                <div className="flex flex-col gap-3">
                  {grupo.servicios.map((servicio) => (
                    <article
                      key={servicio.id}
                      className="flex flex-col gap-2 rounded-xl border border-ink/15 bg-white p-4 shadow-sm"
                    >
                      <h3 className="font-semibold text-ink">{servicio.nombre}</h3>

                      {servicio.direccion && (
                        <p className="flex items-start gap-1.5 text-sm text-ink/70">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
                          <span>
                            {servicio.direccion}
                            {servicio.ciudad ? `, ${servicio.ciudad}` : ''}
                          </span>
                        </p>
                      )}

                      <p className="text-sm text-ink/70">{servicio.descripcion}</p>

                      <div className="mt-1 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-3 text-sm">
                        {servicio.telefono && (
                          <a
                            href={`tel:${servicio.telefono}`}
                            className="flex items-center gap-1 text-ink/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
                          >
                            <Phone className="h-4 w-4" />
                            {servicio.telefono}
                          </a>
                        )}

                        {servicio.whatsapp && (
                          <a
                            href={buildWhatsappUrl(servicio.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-ink/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </a>
                        )}

                        {servicio.email && (
                          <a
                            href={`mailto:${servicio.email}`}
                            className="flex items-center gap-1 text-ink/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
                          >
                            <Mail className="h-4 w-4" />
                            {servicio.email}
                          </a>
                        )}

                        <a
                          href={servicio.fuente_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-ink/60 hover:text-ink"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Fuente: {servicio.fuente_nombre}
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </main>
  );
}
