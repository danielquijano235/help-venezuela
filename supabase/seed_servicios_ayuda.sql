-- HelpVenezuela: servicios y contactos de ayuda reales para quien necesita
-- asistencia (no donar). Ejecutar una sola vez en el SQL editor de Supabase,
-- despues de aplicar el bloque `servicios_ayuda` de schema.sql.
--
-- Carga manual, no es un upsert -- este contenido es editorial y no lo toca
-- ningun cron/scraper.

insert into public.servicios_ayuda
  (nombre, categoria, descripcion, direccion, telefono, whatsapp, email, ciudad, fuente_nombre, fuente_url, confianza)
values
  (
    'Cruz Roja Colombiana - Restablecimiento de Contacto entre Familiares (RCF)',
    'emergencia',
    'Ayuda a reestablecer contacto con familiares en Venezuela cuando las comunicaciones se interrumpen por el desastre. Servicio nacional, no requiere estar en una ciudad especifica.',
    null,
    null,
    '+57 321 213 9525',
    'rcf@cruzrojacolombiana.org',
    null,
    'Semana',
    'https://www.semana.com/nacion/articulo/no-logra-contactar-a-un-familiar-en-venezuela-cruz-roja-colombiana-activo-linea-de-ayuda/202621/',
    'alta'
  ),
  (
    'Línea de atención psicológica (Venezuela)',
    'psicosocial',
    'Línea telefónica gratuita en Venezuela, operada por un equipo multidisciplinario de psicólogos y psiquiatras, para atención psicológica tras los terremotos.',
    null,
    '0-800-29832-01',
    null,
    null,
    null,
    'teleSUR',
    'https://www.telesurtv.net/venezuela-habilita-linea-atencion-psicologica/',
    'media'
  ),
  (
    'Centro Intégrate Medellín',
    'psicosocial',
    'Orientación y apoyo emocional para personas afectadas por los terremotos en Venezuela, incluyendo quienes perdieron familiares o enfrentan situaciones traumáticas.',
    'Carrera 49 #58-40, barrio Prado',
    null,
    null,
    null,
    'Medellín',
    'El Espectador',
    'https://www.elespectador.com/colombia/donde-donar-alimentos-ropa-y-medicamentos-para-los-damnificados-por-terremotos-en-venezuela-lineas-de-ayuda-y-atencion-psicosocial/',
    'media'
  ),
  (
    'Centro Intégrate Cartagena',
    'psicosocial',
    'Orientación y apoyo emocional para personas afectadas por los terremotos en Venezuela.',
    null,
    null,
    null,
    null,
    'Cartagena',
    'El Espectador',
    'https://www.elespectador.com/colombia/donde-donar-alimentos-ropa-y-medicamentos-para-los-damnificados-por-terremotos-en-venezuela-lineas-de-ayuda-y-atencion-psicosocial/',
    'baja'
  );
