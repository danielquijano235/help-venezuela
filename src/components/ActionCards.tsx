import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, HandHeart, Megaphone, ShieldAlert } from 'lucide-react';
import type { TipoDonacion } from '../types/centro';

interface ActionCardsProps {
  centrosCount: number;
  urgentCount: number;
  verifiedCount: number;
  cityCount: number;
  onShowAll: () => void;
  onSelectDonation: (tipo: TipoDonacion) => void;
}

export function ActionCards({
  centrosCount,
  urgentCount,
  verifiedCount,
  cityCount,
  onShowAll,
  onSelectDonation,
}: ActionCardsProps) {
  return (
    <section className="py-8 sm:py-10" aria-labelledby="intent-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h1
          id="intent-heading"
          className="font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-ink sm:text-6xl"
        >
          Empieza por <span className="relative inline-block text-signal">lo que necesitas</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink/70">
          Sin menús complicados. Elige tu situación y te llevamos directo a lo que importa.
        </p>

        <div className="mx-auto mt-6 flex max-w-fit flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-wider text-paper">
          <Stat value={centrosCount} label="centros" />
          <span className="text-paper/25">•</span>
          <Stat value={urgentCount} label="urgentes" accent="text-signal" />
          <span className="text-paper/25">•</span>
          <Stat value={verifiedCount} label="verificados" accent="text-moss" />
          <span className="text-paper/25">•</span>
          <Stat value={cityCount} label="ciudades" accent="text-flag" />
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Ticket
          number="01"
          accent="bg-signal"
          icon={ShieldAlert}
          eyebrow="Puerta 01"
          title="Necesito ayuda"
          description="Estás en peligro o necesitas algo urgente ahora mismo."
          actions={[
            { label: 'Centros urgentes cerca de ti', count: urgentCount, href: '/?estado=urgente' },
            { label: 'Líneas de emergencia y rescate', count: 'línea', href: '/ayuda' },
            { label: 'Apoyo médico y psicosocial', count: 'ver', href: '/ayuda' },
          ]}
          cta={{ label: 'Ver ayuda cerca de mí', href: '/ayuda', className: 'bg-signal hover:bg-signal-dark' }}
        />

        <Ticket
          number="02"
          accent="bg-route"
          icon={HandHeart}
          eyebrow="Puerta 02"
          title="Quiero ayudar"
          description="Tienes algo que dar: cosas, dinero o tu tiempo."
          actions={[
            { label: 'Centros de acopio', count: centrosCount, onClick: onShowAll },
            { label: 'Medicina y agua', count: 'prioridad', onClick: () => onSelectDonation('agua') },
            { label: 'Ropa, comida y pañales', count: 'donar', onClick: () => onSelectDonation('comida') },
          ]}
          cta={{ label: 'Ver dónde donar', onClick: onShowAll, className: 'bg-route hover:bg-route-dark' }}
        />

        <Ticket
          number="03"
          accent="bg-flag"
          icon={BookOpen}
          eyebrow="Puerta 03"
          title="Quiero entender"
          description="Busca información confiable, oficial y al día."
          actions={[
            { label: 'Noticias verificadas', count: 'noticias', href: '/noticias' },
            { label: 'Qué está pasando y cómo va la ayuda', count: 'ver', href: '/noticias' },
            { label: 'Centros por ciudad', count: cityCount, onClick: onShowAll },
          ]}
          cta={{ label: 'Ver noticias e información', href: '/noticias', className: 'bg-flag hover:bg-flag-dark' }}
        />

        <Ticket
          number="04"
          accent="bg-moss"
          icon={Megaphone}
          eyebrow="Puerta 04"
          title="¿Tienes información?"
          description="Comparte un centro, una campaña, un servicio o un grupo donde publican información útil."
          actions={[
            { label: 'Nuevo centro', count: 'enviar', href: '/agregar' },
            { label: 'Dato pendiente', count: 'revisar', href: '/agregar' },
            { label: 'Fuente original', count: 'link', href: '/agregar' },
          ]}
          cta={{ label: 'Compartir información', href: '/agregar', className: 'bg-moss hover:bg-moss-dark' }}
        />
      </div>
    </section>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: string }) {
  return (
    <span>
      <span className={accent ?? 'text-paper'}>{value}</span> {label}
    </span>
  );
}

interface TicketAction {
  label: string;
  count: number | string;
  onClick?: () => void;
  href?: string;
}

interface TicketProps {
  number: string;
  accent: string;
  icon: typeof ShieldAlert;
  eyebrow: string;
  title: string;
  description: string;
  actions: TicketAction[];
  cta: { label: string; onClick?: () => void; href?: string; className: string };
}

function Ticket({ number, accent, icon: Icon, eyebrow, title, description, actions, cta }: TicketProps) {
  return (
    <article className="flex overflow-hidden rounded-2xl border border-ink/15 bg-paper-card shadow-sm">
      <div className={`flex w-16 shrink-0 flex-col items-center justify-between gap-3 p-4 ${accent}`}>
        <span className="font-mono text-xs font-semibold text-paper/85">{number}</span>
        <Icon className="h-6 w-6 text-paper/90" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 border-l-2 border-dashed border-ink/15 p-5">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink/50">{eyebrow}</p>
          <h2 className="mt-1 font-display text-2xl font-bold uppercase leading-none tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">{description}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-ink/10 pt-4 text-sm font-medium text-ink">
          {actions.map((action) => (
            <TicketAction key={action.label} {...action} />
          ))}
        </div>

        {cta.href ? (
          <Link
            to={cta.href}
            className={`mt-auto flex min-h-11 items-center justify-center rounded-lg px-4 font-mono text-sm font-semibold uppercase tracking-wide text-paper transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${cta.className}`}
          >
            {cta.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={cta.onClick}
            className={`mt-auto flex min-h-11 items-center justify-center rounded-lg px-4 font-mono text-sm font-semibold uppercase tracking-wide text-paper transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${cta.className}`}
          >
            {cta.label}
          </button>
        )}
      </div>
    </article>
  );
}

function TicketAction({ label, count, onClick, href }: TicketAction) {
  const content = (
    <>
      <span className="min-w-0 flex-1 leading-5">{label}</span>
      <span className="rounded-full bg-ink/5 px-2.5 py-1 font-mono text-xs font-semibold text-ink/70">
        {count}
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink/40" />
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="flex w-full items-center gap-3 text-left transition-colors hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 text-left transition-colors hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
    >
      {content}
    </button>
  );
}
