-- HelpVenezuela: noticias reales sobre los terremotos en Venezuela y la
-- respuesta humanitaria. Ejecutar una sola vez en el SQL editor de Supabase,
-- despues de aplicar el bloque `noticias` de schema.sql.
--
-- Carga manual, no es un upsert -- este contenido es editorial y no lo toca
-- ningun cron/scraper.

insert into public.noticias
  (titulo, resumen, fecha_publicacion, ciudad, fuente_nombre, fuente_url, confianza)
values
  (
    'Dos fuertes terremotos sacuden Venezuela el 24 de junio',
    'El 24 de junio de 2026 Venezuela fue sacudido por dos sismos con menos de un minuto de diferencia, de magnitud 7.2 y 7.5, con epicentro en el estado Yaracuy.',
    '2026-06-24T00:00:00-04:00',
    null,
    'Wikipedia',
    'https://es.wikipedia.org/wiki/Terremotos_de_Venezuela_de_2026',
    'media'
  ),
  (
    'La cifra de víctimas sube a 1.943 fallecidos y más de 15 mil damnificados',
    'Corte al 30 de junio de 2026: 1.943 fallecidos, 10.571 heridos y más de 15 mil damnificados reportados tras los terremotos en Venezuela.',
    '2026-06-30T00:00:00-04:00',
    null,
    'Univision',
    'https://www.univision.com/noticias/america-latina/ultimas-noticias-terremotos-venezuela-hoy-martes-30-junio-2026-en-vivo',
    'media'
  ),
  (
    'Más de mil rescatistas internacionales se despliegan en Venezuela con apoyo de la ONU',
    'Equipos de búsqueda y rescate de Chile, Colombia, Estados Unidos, Italia, Suiza y otros países se suman a la respuesta internacional coordinada por Naciones Unidas.',
    '2026-06-27T00:00:00-04:00',
    null,
    'Noticias ONU',
    'https://news.un.org/es/story/2026/06/1541610',
    'alta'
  ),
  (
    'Colombia envía el equipo de búsqueda y rescate USAR COL-1 a través de la UNGRD',
    'La Unidad Nacional para la Gestión del Riesgo de Desastres activó un equipo de más de 60 especialistas, cuatro binomios caninos y cerca de 12 toneladas de equipos especializados hacia Venezuela.',
    '2026-06-25T00:00:00-05:00',
    null,
    'El Colombiano',
    'https://www.elcolombiano.com/inicio/terremoto-venezuela-colombia-enviara-ayuda-con-ungrd-GC38182150',
    'media'
  ),
  (
    'Plataformas colombianas habilitan envíos de dinero a Venezuela sin cobro de comisión',
    'Varias plataformas de transferencias en Colombia eliminaron temporalmente la comisión para envíos de dinero a Venezuela, como apoyo a los afectados por el terremoto.',
    '2026-06-29T00:00:00-05:00',
    null,
    'Infobae',
    'https://www.infobae.com/venezuela/2026/06/29/terremoto-en-venezuela-plataformas-en-colombia-permiten-transferencias-de-dinero-sin-cobro-de-comision-asi-funciona/',
    'media'
  );
