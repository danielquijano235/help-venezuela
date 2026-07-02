import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useMapPoints } from '../hooks/useMapPoints';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BackLink } from '../components/BackLink';
import { StatusBadge } from '../components/StatusBadge';
import { buildGoogleMapsUrl, buildWhatsappUrl } from '../lib/maps';
import { ESTADOS, CATEGORIAS_SERVICIO } from '../data/constants';
import type { Centro, Estado } from '../types/centro';
import type { CategoriaServicio } from '../types/servicioAyuda';
import type { MapPoint } from '../types/mapPoint';

const VENEZUELA_CENTER: [number, number] = [7.8, -66.1];
const VENEZUELA_ZOOM = 6;

const ESTADO_COLORS: Record<Estado, string> = {
  urgente: '#d9480f',
  activo: '#3f6b4a',
  cerrado: '#8a847c',
};

// Prioridad para el color del pin de ciudad: si hay algún centro urgente el pin
// se pinta de urgente; si no, activo; si no, cerrado.
const ESTADO_PRIORITY: Estado[] = ['urgente', 'activo', 'cerrado'];

const CATEGORIA_COLORS: Record<CategoriaServicio, string> = {
  emergencia: '#d9480f',
  medico: '#1e4c8a',
  psicosocial: '#f0b429',
  legal: '#2f5238',
  refugio: '#163a6b',
  otros: '#6b6560',
};

function cityColor(centros: Centro[]): string {
  const estado = ESTADO_PRIORITY.find((e) => centros.some((c) => c.estado === e));
  return ESTADO_COLORS[estado ?? 'activo'];
}

// Solo mostramos la dirección / "Cómo llegar" cuando el texto parece una
// dirección real; muchos centros traen "Dirección por confirmar" o prosa suelta.
function hasRealAddress(direccion: string): boolean {
  const d = direccion
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  if (d.length < 8 || d.length > 140) return false;
  return !['por confirmar', 'se han habilitado', 'ciudadanos', 'voluntarios', 'enlace de la bio'].some(
    (bad) => d.includes(bad),
  );
}

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

  // Cada pin de ciudad se recorta a los centros que pasan el filtro de estado;
  // si ninguno pasa, la ciudad se oculta por completo.
  const visiblePoints = useMemo(
    () =>
      points.flatMap((point): MapPoint[] => {
        if (point.kind === 'ciudad') {
          if (!showCentros) return [];
          const centros = point.centros.filter((c) => visibleEstados.has(c.estado));
          return centros.length > 0 ? [{ ...point, centros }] : [];
        }
        return showServicios && visibleCategorias.has(point.data.categoria) ? [point] : [];
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
        Los centros de acopio se agrupan por ciudad (la mayoría se reporta sin dirección
        exacta): cada punto reúne los centros de esa ciudad. Los servicios de ayuda sí se
        ubican individualmente.
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
                point.kind === 'ciudad' ? (
                  <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={pointIcon(cityColor(point.centros), 'circle')}
                  >
                    <Popup>
                      <div className="flex max-w-[18rem] flex-col gap-2">
                        <div>
                          <p className="font-semibold text-ink">{point.ciudad}</p>
                          <p className="text-xs text-ink/60">
                            {point.centros.length}{' '}
                            {point.centros.length === 1 ? 'centro de acopio' : 'centros de acopio'}
                          </p>
                        </div>
                        <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                          {point.centros.map((centro) => (
                            <li
                              key={centro.id}
                              className="border-t border-ink/10 pt-2 first:border-t-0 first:pt-0"
                            >
                              <p className="text-sm font-medium text-ink">{centro.nombre}</p>
                              <div className="mt-0.5">
                                <StatusBadge estado={centro.estado} verificado={centro.verificado} />
                              </div>
                              {hasRealAddress(centro.direccion) && (
                                <p className="mt-1 flex items-start gap-1 text-xs text-ink/70">
                                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                  {centro.direccion}
                                </p>
                              )}
                              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                {hasRealAddress(centro.direccion) && (
                                  <a
                                    href={buildGoogleMapsUrl(
                                      centro.direccion,
                                      centro.ciudad,
                                      centro.pais,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 font-medium text-signal hover:text-signal-dark"
                                  >
                                    <MapPin className="h-3.5 w-3.5" />
                                    Cómo llegar
                                  </a>
                                )}
                                {centro.whatsapp && (
                                  <a
                                    href={buildWhatsappUrl(centro.whatsapp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-ink/60 hover:text-ink"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
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

          {visiblePoints.length === 0 && (
            <p className="mt-4 text-center text-sm text-ink/50">
              No hay puntos que mostrar con los filtros actuales.
            </p>
          )}
        </>
      )}
    </main>
  );
}
