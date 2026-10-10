-- ============================================================
-- Datos de demostración para la Bandeja de Solicitudes (HU-04)
-- 15 expedientes con estados y antigüedades variadas:
-- pendientes vencidas (+48 h), pendientes recientes, observadas,
-- aprobadas y rechazadas.
--
-- Aplicar con rol con permisos de escritura (Jhoan, líder de BD),
-- por ejemplo desde el editor SQL del panel de Supabase:
--   1. Ejecutar este archivo.
--   2. Verificar con: SELECT estado, COUNT(*) FROM solicitud GROUP BY estado;
-- El rol de servicio del backend no tiene INSERT en estas tablas.
-- ============================================================

WITH base(ci, ext, nombre, apellido, email, telefono, sis, anio, carrera_patron, horas, estado) AS (
  VALUES
    ('6849201', NULL, 'Alejandro', 'Rojas Torrico', 'alejandro.rojas@gmail.com', '71234567', 201804921, 2020, '%Sistemas%', 54, 'Pendiente'),
    ('7942105', NULL, 'Carla Beatriz', 'Montaño', 'c.montano@est.umss.edu', '76543210', 201701234, 2019, '%Sistemas%', 49, 'Pendiente'),
    ('4720918', NULL, 'Jorge', 'Morales Villarroel', 'jorge.mv@gmail.com', '77441122', 201602119, 2018, '%Sistemas%', 72, 'Pendiente'),
    ('5294021', NULL, 'Mauricio Fernando', 'Claros', 'm.claros@est.umss.edu', '78889900', 201904581, 2021, '%Sistemas%', 14, 'Pendiente'),
    ('8412954', NULL, 'Mariana', 'Bustamante Paz', 'mariana.bp@outlook.com', '70112233', 201903310, 2021, '%Sistemas%', 32, 'Pendiente'),
    ('7930114', NULL, 'Valeria', 'Gonzales Mercado', 'valeria.gonzales@gmail.com', '79998877', 201901184, 2020, '%Sistemas%', 26, 'Pendiente'),
    ('6543210', NULL, 'Diego', 'Paredes Claure', 'diego.pc@gmail.com', '71001020', 202001455, 2022, '%Inform%', 6, 'Pendiente'),
    ('7890123', NULL, 'Lucía', 'Quispe Mamani', 'lucia.qm@est.umss.edu', '73040506', 202102233, 2023, '%Sistemas%', 5, 'Pendiente'),
    ('8901234', NULL, 'Marco', 'Terrazas Lopez', 'marco.tl@gmail.com', '75060708', 201905544, 2021, '%Inform%', 50, 'Pendiente'),
    ('9012345', NULL, 'Rosa', 'Aguilar Siles', 'rosa.as@est.umss.edu', '77080910', 201806677, 2019, '%Sistemas%', 10, 'Pendiente'),
    ('6123456', NULL, 'Paola', 'Vargas Hurtado', 'paola.vh@gmail.com', '79101112', 202003889, 2022, '%Sistemas%', 30, 'OBSERVED'),
    ('7234567', NULL, 'Carlos', 'Mendez Roca', 'carlos.mr@est.umss.edu', '71121314', 201707990, 2018, '%Sistemas%', 55, 'OBSERVED'),
    ('8345678', NULL, 'Sofía', 'Reyes Camacho', 'sofia.rc@gmail.com', '73141516', 202104101, 2023, '%Sistemas%', 90, 'APPROVED'),
    ('9456789', NULL, 'Andrés', 'López Ferreira', 'andres.lf@est.umss.edu', '75161718', 201608212, 2017, '%Inform%', 100, 'REJECTED'),
    ('5678901', '1A', 'Elena', 'Torrez Gutiérrez', 'elena.tg@gmail.com', '77181920', 202205323, 2024, '%Sistemas%', 3, 'Pendiente')
),
detalle AS (
  INSERT INTO detalle_solicitud (
    id_carrera, nombre, apellido, telefono, email, ci, extension_ci,
    anio_egreso, cod_sis
  )
  SELECT
    (SELECT id FROM carrera WHERE nombre ILIKE base.carrera_patron LIMIT 1),
    base.nombre, base.apellido, base.telefono, base.email, base.ci, base.ext,
    base.anio, base.sis
  FROM base
  RETURNING id, ci
),
documento AS (
  INSERT INTO documento_respaldo (id_tipo_archivo, tamanio_mb, ruta_storage, fecha_creacion, es_valido)
  SELECT NULL, 2, 'demo/' || detalle.ci || '.pdf', NOW(), FALSE
  FROM detalle
  RETURNING id
),
d AS (
  SELECT id, ci, ROW_NUMBER() OVER (ORDER BY ci) AS fila FROM detalle
),
doc AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS fila FROM documento
)
INSERT INTO solicitud (id_detalle_solicitud, id_documento_respaldo, estado, fecha_creacion)
SELECT d.id, doc.id, base.estado, NOW() - (base.horas || ' hours')::INTERVAL
FROM d
JOIN doc ON doc.fila = d.fila
JOIN base ON base.ci = d.ci;
