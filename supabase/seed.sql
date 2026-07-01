-- HelpVenezuela: primera carga real conservadora.
-- Ejecutar en el SQL editor del proyecto de Supabase, despues de schema.sql.
--
-- Fuente inicial: nota publicada el 27 de junio de 2026 sobre la jornada
-- "Una Garra por Venezuela" con Alcaldia/IDPYBA/Bomberos/Laika/Avianca.
-- Estos puntos se cargan como "sin verificar" para conservar la distincion
-- entre dato publicado y moderacion manual del equipo.

insert into public.centros
  (
    nombre,
    organizacion,
    ciudad,
    direccion,
    estado,
    tipos_donacion,
    telefono,
    whatsapp,
    publicacion_url,
    descripcion,
    verificado,
    fuente_nombre,
    fuente_url,
    external_id,
    ultima_revision,
    ultima_vista,
    confianza
  )
values
  (
    'Bomberos Bogotá - Estación Puente Aranda',
    'Bomberos Oficiales de Bogotá / IDPYBA',
    'Bogotá',
    'Calle 20 #68A-06',
    'activo',
    array['mascotas','comida','medicina','otros'],
    null,
    null,
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'Punto reportado para alimentos, medicamentos veterinarios, platos desechables y otros insumos para animales afectados. Verificar vigencia antes de donar.',
    false,
    'Tropicana / Bomberos Bogotá',
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'bogota-bomberos-puente-aranda-2026-06',
    '2026-06-27T12:00:00-05:00',
    now(),
    'media'
  ),
  (
    'Bomberos Bogotá - Estación Kennedy',
    'Bomberos Oficiales de Bogotá / IDPYBA',
    'Bogotá',
    'Carrera 79 #41D-20 sur',
    'activo',
    array['mascotas','comida','medicina','otros'],
    null,
    null,
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'Punto reportado para alimentos, medicamentos veterinarios, platos desechables y otros insumos para animales afectados. Verificar vigencia antes de donar.',
    false,
    'Tropicana / Bomberos Bogotá',
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'bogota-bomberos-kennedy-2026-06',
    '2026-06-27T12:00:00-05:00',
    now(),
    'media'
  ),
  (
    'Bomberos Bogotá - Estación Chapinero',
    'Bomberos Oficiales de Bogotá / IDPYBA',
    'Bogotá',
    'Carrera Novena A #61-77',
    'activo',
    array['mascotas','comida','medicina','otros'],
    null,
    null,
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'Punto reportado para alimentos, medicamentos veterinarios, platos desechables y otros insumos para animales afectados. Verificar vigencia antes de donar.',
    false,
    'Tropicana / Bomberos Bogotá',
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'bogota-bomberos-chapinero-2026-06',
    '2026-06-27T12:00:00-05:00',
    now(),
    'media'
  ),
  (
    'Bomberos Bogotá - Estación Restrepo',
    'Bomberos Oficiales de Bogotá / IDPYBA',
    'Bogotá',
    'Avenida carrera 27 #19A-10 sur',
    'activo',
    array['mascotas','comida','medicina','otros'],
    null,
    null,
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'Punto reportado para alimentos, medicamentos veterinarios, platos desechables y otros insumos para animales afectados. Verificar vigencia antes de donar.',
    false,
    'Tropicana / Bomberos Bogotá',
    'https://www.tropicanafm.com/2026/terremotos-en-venezuela-asi-puede-donar-a-los-animales-afectados-centros-de-acopio-en-bogota-469003.html',
    'bogota-bomberos-restrepo-2026-06',
    '2026-06-27T12:00:00-05:00',
    now(),
    'media'
  )
on conflict (fuente_nombre, external_id)
do update set
  nombre = excluded.nombre,
  organizacion = excluded.organizacion,
  ciudad = excluded.ciudad,
  direccion = excluded.direccion,
  estado = excluded.estado,
  tipos_donacion = excluded.tipos_donacion,
  publicacion_url = excluded.publicacion_url,
  descripcion = excluded.descripcion,
  fuente_url = excluded.fuente_url,
  ultima_revision = excluded.ultima_revision,
  ultima_vista = excluded.ultima_vista,
  confianza = excluded.confianza;
