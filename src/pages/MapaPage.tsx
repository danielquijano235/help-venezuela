import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useMapPoints } from '../hooks/useMapPoints';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BackLink } from '../components/BackLink';
import { StatusBadge } from '../components/StatusBadge';
import { DonationTypeTag } from '../components/DonationTypeTag';
import { buildGoogleMapsUrl, buildWhatsappUrl } from '../lib/maps';
import { ESTADOS, CATEGORIAS_SERVICIO } from '../data/constants';
import type { Estado } from '../types/centro';
import type { CategoriaServicio } from '../types/servicioAyuda';

const VENEZUELA_CENTER: [number, number] = [7.8, -66.1];
const VENEZUELA_ZOOM = 6;

const ESTADO_COLORS: Record<Estado, string> = {
  urgente: '#d9480f',
  activo: '#3f6b4a',
  cerrado: '#8a847c',
};

const CATEGORIA_COLORS: Record<CategoriaServicio, string> = {
  emergencia: '#d9480f',
  medico: '#1e4c8a',
  psicosocial: '#f0b429',
  legal: '#2f5238',
  refugio: '#163a6b',
  otros: '#6b6560',
};

function pointIcon(color: string, shape: 'circle' | 'diamond') {
  const transform = shape === 'diamond' ? 'rotate(45deg)' : 'none';
  return divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:${
      shape === 'circle' ? '9999px' : '3px'
    };background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5);transform:${transform};"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

export function MapaPage() {
  const { points, loading, error, usingFallback } = useMapPoints();

  const [visibleEstados, setVisibleEstados] = useState<Set<Estado>>(
    () => new Set(ESTADOS.map((e) => e.value)),
  );
  const [visibleCategorias, setVisibleCategorias] = useState<Set<CategoriaServicio>>(
    () => new Set(CATEGORIAS_SERVICIO.map((c) => c.value)),
  );
  const [showCentros, setShowCentros] = useState(true);
  const [showServicios, setShowServicios] = useState(true);

  function toggleEstado(estado: Estado) {
    setVisibleEstados((prev) => {
      const next = new Set(prev);
      if (next.has(estado)) next.delete(estado);
      else next.add(estado);
      return next;
    });
  }

  function toggleCategoria(categoria: CategoriaServicio) {
    setVisibleCategorias((prev) => {
      const next = new Set(prev);
      if (next.has(categoria)) next.delete(categoria);
      else next.add(categoria);
      return next;
    });
  }

  const visiblePoints = useMemo(
    () =>
      points.filter((point) => {
        if (point.kind === 'centro') return showCentros && visibleEstados.has(point.data.estado);
        return showServicios && visibleCategorias.has(point.data.categoria);
      }),
    [points, showCentros, showServicios, visibleEstados, visibleCategorias],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <BackLink to="/ayuda" label="Volver a ayuda" />
      <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-wider text-signal">
        Necesito ayuda
      </p>
      <h1 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-ink sm:text-4xl">
        Mapa de puntos en Venezuela
      </h1>
      <p className="mt-2 text-ink/70">
        Centros de acopio y servicios de ayuda ubicados sobre un mapa. Cuando no hay una
        dirección exacta, el punto se ubica a nivel de ciudad.
      </p>

      {!loading && usingFallback && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-flag/40 bg-flag/10 p-3 text-sm text-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag-dark" />
          <span>
            No pudimos conectar con Supabase. Mostramos los datos locales disponibles
            mientras vuelve la conexión.
          </span>
        </div>
      )}

      {!loading && error && !usingFallback && (
        <p className="mt-4 rounded-lg border border-signal/30 bg-signal/10 p-3 text-sm text-signal-dark">
          No se pudieron cargar los puntos del mapa: {error}
        </p>
      )}

      {loading && <LoadingSpinner label="Cargando puntos de Venezuela..." />}

      {!loading && (
        <>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row">
            <div className="flex w-full flex-col gap-3 rounded-lg border border-ink/15 bg-white p-3 text-sm shadow-sm lg:w-56 lg:shrink-0">
              <div>
                <label className="flex items-center gap-2 font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={showCentros}
                    onChange={() => setShowCentros((prev) => !prev)}
                  />
                  Centros de acopio
                </label>
                <div className="mt-1.5 flex flex-col gap-1 pl-5">
                  {ESTADOS.map((estado) => (
                    <label key={estado.value} className="flex items-center gap-2 text-ink/70">
                      <input
                        type="checkbox"
                        checked={visibleEstados.has(estado.value)}
                        onChange={() => toggleEstado(estado.value)}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ESTADO_COLORS[estado.value] }}
                      />
                      {estado.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-ink/10 pt-3">
                <label className="flex items-center gap-2 font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={showServicios}
                    onChange={() => setShowServicios((prev) => !prev)}
                  />
                  Servicios de ayuda
                </label>
                <div className="mt-1.5 flex flex-col gap-1 pl-5">
                  {CATEGORIAS_SERVICIO.map((categoria) => (
                    <label key={categoria.value} className="flex items-center gap-2 text-ink/70">
                      <input
                        type="checkbox"
                        checked={visibleCategorias.has(categoria.value)}
                        onChange={() => toggleCategoria(categoria.value)}
                      />
                      <span
                        className="h-2.5 w-2.5"
                        style={{
                          backgroundColor: CATEGORIA_COLORS[categoria.value],
                          transform: 'rotate(45deg)',
                        }}
                      />
                      {categoria.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[65vh] min-h-[420px] w-full overflow-hidden rounded-xl border-2 border-ink">
              <MapContainer
                center={VENEZUELA_CENTER}
                zoom={VENEZUELA_ZOOM}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {visiblePoints.map((point) =>
                point.kind === 'centro' ? (
                  <Marker
                    key={`centro-${point.id}`}
                    position={[point.lat, point.lng]}
                    icon={pointIcon(ESTADO_COLORS[point.data.estado], 'circle')}
                  >
                    <Popup>
                      <div className="flex max-w-[16rem] flex-col gap-1.5">
                        <p className="font-semibold text-ink">{point.data.nombre}</p>
                        <StatusBadge estado={point.data.estado} verificado={point.data.verificado} />
                        <p className="flex items-start gap-1 text-xs text-ink/70">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {point.data.direccion}, {point.data.ciudad}
                        </p>
                        {point.data.tipos_donacion.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {point.data.tipos_donacion.map((tipo) => (
                              <DonationTypeTag key={tipo} tipo={tipo} />
                            ))}
                          </div>
                        )}
                        <div className="mt-1 flex flex-wrap gap-2 border-t border-ink/10 pt-1.5 text-xs">
                          <a
                            href={buildGoogleMapsUrl(point.data.direccion, point.data.ciudad, point.data.pais)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-medium text-signal hover:text-signal-dark"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Cómo llegar
                          </a>
                          {point.data.whatsapp && (
                            <a
                              href={buildWhatsappUrl(point.data.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-ink/60 hover:text-ink"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ) : (
                  <Marker
                    key={`servicio-${point.id}`}
                    position={[point.lat, point.lng]}
                    icon={pointIcon(CATEGORIA_COLORS[point.data.categoria], 'diamond')}
                  >
                    <Popup>
                      <div className="flex max-w-[16rem] flex-col gap-1.5">
                        <p className="font-semibold text-ink">{point.data.nombre}</p>
                        <p className="text-xs text-ink/70">{point.data.descripcion}</p>
                        {point.data.direccion && (
                          <p className="flex items-start gap-1 text-xs text-ink/70">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {point.data.direccion}
                            {point.data.ciudad ? `, ${point.data.ciudad}` : ''}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-2 border-t border-ink/10 pt-1.5 text-xs">
                          {point.data.telefono && (
                            <a
                              href={`tel:${point.data.telefono}`}
                              className="flex items-center gap-1 text-ink/60 hover:text-ink"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Llamar
                            </a>
                          )}
                          {point.data.whatsapp && (
                            <a
                              href={buildWhatsappUrl(point.data.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-ink/60 hover:text-ink"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          )}
                          {point.data.email && (
                            <a
                              href={`mailto:${point.data.email}`}
                              className="flex items-center gap-1 text-ink/60 hover:text-ink"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Email
                            </a>
                          )}
                          <a
                            href={point.data.fuente_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-ink/60 hover:text-ink"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Fuente
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ),
              )}
            </MapContainer>
            </div>
          </div>

          {points.length === 0 && (
            <p className="mt-4 text-center text-sm text-ink/50">
              Todavía no hay puntos con dirección para mostrar en el mapa.
            </p>
          )}
        </>
      )}
    </main>
  );
}
