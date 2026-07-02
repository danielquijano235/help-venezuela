import { CalendarClock, ExternalLink, MapPin, MessageCircle, Phone } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { DonationTypeTag } from './DonationTypeTag';
import { buildGoogleMapsUrl, buildWhatsappUrl } from '../lib/maps';
import type { Centro } from '../types/centro';

interface CenterCardProps {
  centro: Centro;
}

export function CenterCard({ centro }: CenterCardProps) {
  const fuenteUrl = centro.fuente_url ?? centro.publicacion_url;
  const ultimaRevision = formatDate(centro.ultima_revision ?? centro.ultima_vista);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink/15 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-ink">{centro.nombre}</h3>
          {centro.organizacion && <p className="text-sm text-ink/50">{centro.organizacion}</p>}
        </div>
        <StatusBadge estado={centro.estado} verificado={centro.verificado} />
      </div>

      <p className="flex items-start gap-1.5 text-sm text-ink/70">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
        <span>
          {centro.direccion}, {centro.ciudad}
        </span>
      </p>

      {centro.tipos_donacion.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {centro.tipos_donacion.map((tipo) => (
            <DonationTypeTag key={tipo} tipo={tipo} />
          ))}
        </div>
      )}

      {centro.descripcion && <p className="text-sm text-ink/70">{centro.descripcion}</p>}

      <div className="flex flex-wrap gap-1.5 text-xs text-ink/60">
        <span className="rounded-full bg-route/10 px-2 py-1 font-medium text-route">
          {centro.ciudad}
        </span>
        {centro.fuente_nombre && (
          <span className="rounded-full bg-ink/5 px-2 py-1">Fuente: {centro.fuente_nombre}</span>
        )}
        {ultimaRevision && (
          <span className="inline-flex items-center gap-1 rounded-full bg-flag/15 px-2 py-1 text-flag-dark">
            <CalendarClock className="h-3.5 w-3.5" />
            Revisado {ultimaRevision}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-3 text-sm">
        <a
          href={buildGoogleMapsUrl(centro.direccion, centro.ciudad, centro.pais)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-medium text-signal hover:text-signal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
        >
          <MapPin className="h-4 w-4" />
          Cómo llegar
        </a>

        {centro.telefono && (
          <a
            href={`tel:${centro.telefono}`}
            className="flex items-center gap-1 text-ink/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
          >
            <Phone className="h-4 w-4" />
            Llamar
          </a>
        )}

        {centro.whatsapp && (
          <a
            href={buildWhatsappUrl(centro.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-ink/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}

        {fuenteUrl && (
          <a
            href={fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-ink/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
          >
            <ExternalLink className="h-4 w-4" />
            Ver fuente
          </a>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
