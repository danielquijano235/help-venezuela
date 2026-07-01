import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { supabase, supabaseConfigError } from '../lib/supabaseClient';
import { CIUDADES, TIPOS_DONACION } from '../data/constants';
import type { NewCentro, TipoDonacion } from '../types/centro';

const initialForm = {
  nombre: '',
  organizacion: '',
  ciudad: '',
  direccion: '',
  telefono: '',
  whatsapp: '',
  publicacion_url: '',
  descripcion: '',
};

export function AddCenterPage() {
  const [form, setForm] = useState(initialForm);
  const [tipos, setTipos] = useState<TipoDonacion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof typeof initialForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTipo(tipo: TipoDonacion) {
    setTipos((prev) => (prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]));
  }

  const isValid = form.nombre.trim() && form.ciudad && form.direccion.trim() && tipos.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setSubmitError(null);

    if (!supabase) {
      setSubmitError(
        supabaseConfigError ??
          'No se pudo conectar con Supabase. Revisa la configuracion antes de enviar centros.'
      );
      setSubmitting(false);
      return;
    }

    const payload: NewCentro = {
      nombre: form.nombre.trim(),
      organizacion: form.organizacion.trim() || null,
      ciudad: form.ciudad,
      direccion: form.direccion.trim(),
      estado: 'activo',
      tipos_donacion: tipos,
      telefono: form.telefono.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      publicacion_url: form.publicacion_url.trim() || null,
      descripcion: form.descripcion.trim() || null,
    };

    const { error } = await supabase.from('centros').insert(payload);

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setSuccess(true);
    setForm(initialForm);
    setTipos([]);
  }

  if (success) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-moss" />
        <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-ink">
          ¡Gracias por tu aporte!
        </h1>
        <p className="mt-2 text-ink/70">
          Tu centro fue agregado y aparecerá marcado como "Sin verificar" en el listado hasta
          que sea revisado.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-signal px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wide text-paper hover:bg-signal-dark"
        >
          Ver listado de centros
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink">
        Agregar centro de acopio
      </h1>
      <p className="mt-1 text-ink/70">
        Comparte un punto de recolección de donaciones en Colombia. La información será
        revisada antes de marcarse como verificada.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-ink/80">
            Nombre del centro *
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          />
        </div>

        <div>
          <label htmlFor="organizacion" className="block text-sm font-medium text-ink/80">
            Organización (opcional)
          </label>
          <input
            id="organizacion"
            type="text"
            value={form.organizacion}
            onChange={(e) => updateField('organizacion', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          />
        </div>

        <div>
          <label htmlFor="ciudad" className="block text-sm font-medium text-ink/80">
            Ciudad *
          </label>
          <select
            id="ciudad"
            required
            value={form.ciudad}
            onChange={(e) => updateField('ciudad', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          >
            <option value="" disabled>
              Selecciona una ciudad
            </option>
            {CIUDADES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-ink/80">
            Dirección *
          </label>
          <input
            id="direccion"
            type="text"
            required
            value={form.direccion}
            onChange={(e) => updateField('direccion', e.target.value)}
            placeholder="Carrera 7 # 45-10, Chapinero"
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-ink/80">
            ¿Qué tipo de donaciones recibe? *
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIPOS_DONACION.map(({ value, label, icon: Icon }) => {
              const active = tipos.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleTipo(value)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'border-route bg-route text-paper'
                      : 'border-ink/20 bg-white text-ink/70 hover:border-route/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-ink/80">
            Teléfono (opcional)
          </label>
          <input
            id="telefono"
            type="tel"
            value={form.telefono}
            onChange={(e) => updateField('telefono', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-ink/80">
            WhatsApp (opcional)
          </label>
          <input
            id="whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
            placeholder="+57 300 1234567"
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          />
        </div>

        <div>
          <label htmlFor="publicacion_url" className="block text-sm font-medium text-ink/80">
            Link a publicación original (Instagram/Facebook, opcional)
          </label>
          <input
            id="publicacion_url"
            type="url"
            value={form.publicacion_url}
            onChange={(e) => updateField('publicacion_url', e.target.value)}
            placeholder="https://www.instagram.com/p/..."
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-ink/80">
            Notas adicionales (opcional)
          </label>
          <textarea
            id="descripcion"
            rows={3}
            value={form.descripcion}
            onChange={(e) => updateField('descripcion', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/20 bg-white py-2 px-3 text-sm text-ink focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
          />
        </div>

        {submitError && (
          <p className="rounded-lg border border-signal/30 bg-signal/10 p-3 text-sm text-signal-dark">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="rounded-lg bg-signal px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wide text-paper hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Agregar centro'}
        </button>
      </form>
    </main>
  );
}
