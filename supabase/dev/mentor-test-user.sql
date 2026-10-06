-- SOLO DESARROLLO: ejecutar manualmente en la base de datos local/de pruebas.
-- No ejecutar en producción. No crea una cuenta real de Supabase Auth.
BEGIN;

INSERT INTO public.usuario (usuario_id, nombre, rol)
VALUES (
  '00000000-0000-4000-8000-000000000006',
  'Mentor de prueba (solo desarrollo)',
  'egresado'
)
ON CONFLICT (usuario_id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol;

INSERT INTO public.egresado (id, apellido, cod_sis, anio_ingreso, grado)
VALUES (
  '00000000-0000-4000-8000-000000000006',
  'Prueba',
  999999,
  2020,
  'Licenciatura'
)
ON CONFLICT (id) DO UPDATE
SET apellido = EXCLUDED.apellido,
    cod_sis = EXCLUDED.cod_sis,
    anio_ingreso = EXCLUDED.anio_ingreso,
    grado = EXCLUDED.grado;

INSERT INTO public.mentor (
  id,
  experiencia,
  esta_activo,
  anios_exp,
  fecha_creacion,
  fecha_actualizacion
)
VALUES (
  '00000000-0000-4000-8000-000000000006',
  'Perfil ficticio para pruebas locales.',
  TRUE,
  0,
  CURRENT_DATE,
  CURRENT_DATE
)
ON CONFLICT (id) DO UPDATE
SET experiencia = EXCLUDED.experiencia,
    esta_activo = TRUE,
    anios_exp = EXCLUDED.anios_exp,
    fecha_actualizacion = CURRENT_DATE;

COMMIT;
