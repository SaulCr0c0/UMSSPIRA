-- ============================================================
-- Seed de demostración para Supabase (épicas 1-9)
--
-- Puebla las tablas de catálogo y crea las entidades de demostración que
-- esperan los POST del frontend y la colección Postman:
--   * Épica 6 (mentoría): usuario/titulado/mentor + áreas e intereses +
--     disponibilidad para el usuario de prueba del guard de desarrollo.
--   * Épica 6 (empresa/vacantes): empresa demo del dev-token + vacantes.
--   * Épica 4 (eventos): eventos publicados y un borrador.
--   * Épica 8 (registro/validación): catálogo tipo_archivo/carrera y
--     solicitudes en varios estados para la bandeja y los reportes.
--   * Épica 5 (reportes): catálogo tipo_reporte.
--
-- Cómo aplicarlo (rol con permisos de escritura, por ejemplo desde el editor
-- SQL del panel de Supabase):
--   1. Ejecutar este archivo completo.
--   2. Verificar con: SELECT (SELECT count(*) FROM area) AS areas,
--      (SELECT count(*) FROM solicitud) AS solicitudes;
--
-- Se puede ejecutar varias veces: cada fila lleva un UUID fijo y usa
-- ON CONFLICT DO NOTHING, así que no duplica datos ni choca con los seeds
-- supabase/seed.dev.sql y supabase/seed-hu4-demo.sql.
--
-- IDs fijos que usan otras herramientas (no cambiar):
--   a0000000-0000-4000-8000-000000000001  usuario EMPRESA (scripts/dev-token.js)
--   b0000000-0000-4000-8000-000000000001  empresa del dev-token (empresaId del JWT)
--   00000000-0000-4000-8000-000000000006  mentor de pruebas (mentor-test-auth.guard:
--                                         token umsspira-local-mentor-test-only)
--   20000000-0000-4000-8000-000000000001  área raíz "Desarrollo Web" (ejemplos Postman)
--   20000000-0000-4000-8000-000000000002  área raíz "DevOps" (ejemplos Postman)
--   11111111-1111-4111-8111-111111111111  interés "Node.js" (variable interestId)
--
-- Notas para QA (evitar "peleas" al probar los formularios):
--   * El registro de titulado rechaza duplicados por ci, correo o código SIS.
--     Las solicitudes de este seed usan los valores listados al final; para
--     registrar una solicitud nueva use otros ci/correo/codSis, o ponga antes
--     esas solicitudes en estado 'rechazado'/'rechazada'.
--   * Los estados de `solicitud` conviven en varios dialectos porque así los
--     escribe el código: 'Pendiente' (registro), 'APPROVED'/'OBSERVED'/
--     'REJECTED' (dictamen) y 'verificado'/'observado' (reporte PDF).
--   * Los eventos guardan `estado` en minúsculas ('publicado'/'borrador') tal
--     como los escribe la API, aunque los DTO usen 'BORRADOR'/'PUBLICADO'.
--   * Este seed NO crea usuarios de Supabase Auth ni toca Storage: las pruebas
--     usan los tokens de desarrollo (scripts/dev-token.js y el guard de mentor).
--   * No se usan las columnas vacante.nivel_experiencia,
--     vacante.descripcion_tecnica ni detalle_solicitud.expedido_en porque no
--     están aplicadas en todas las bases (migraciones 0002_ajuste_detalle_solicitud
--     y 0003_vacante_campos_publicacion pendientes en la BD en la nube).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Catálogo de carreras
-- ------------------------------------------------------------
INSERT INTO carrera (id, nombre) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Ingeniería de Sistemas'),
  ('10000000-0000-4000-8000-000000000002', 'Ingeniería Informática')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Tipos de archivo: primero los formatos que busca el registro de
--    titulación (PDF/PNG/JPG según el MIME del archivo) y luego los tipos
--    de documento que usa como respaldo.
-- ------------------------------------------------------------
INSERT INTO tipo_archivo (id, nombre) VALUES
  ('21000000-0000-4000-8000-000000000001', 'PDF'),
  ('21000000-0000-4000-8000-000000000002', 'PNG'),
  ('21000000-0000-4000-8000-000000000003', 'JPG'),
  ('21000000-0000-4000-8000-000000000004', 'Título en Provisión Nacional'),
  ('21000000-0000-4000-8000-000000000005', 'Diploma Académico'),
  ('21000000-0000-4000-8000-000000000006', 'Certificado de Egreso')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 3. Modalidades de trabajo (catálogo de requerimientos laborales)
-- ------------------------------------------------------------
INSERT INTO modalidad_trabajo (id, nombre) VALUES
  ('22000000-0000-4000-8000-000000000001', 'PRESENCIAL'),
  ('22000000-0000-4000-8000-000000000002', 'HIBRIDO'),
  ('22000000-0000-4000-8000-000000000003', 'REMOTO')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 4. Tipos de reporte (épica 5)
-- ------------------------------------------------------------
INSERT INTO tipo_reporte (id, nombre, descripcion, disponibilidad) VALUES
  ('23000000-0000-4000-8000-000000000001', 'Nómina de egresados', 'Listado de titulados por carrera y estado.', TRUE),
  ('23000000-0000-4000-8000-000000000002', 'Solicitudes de titulación', 'Estado de las solicitudes recibidas.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 5. Áreas técnicas (raíces) e intereses (hijos) para mentoría y perfil
--    Regla del módulo: raíz = padre_id NULL; interés = hijo de una raíz.
--    area.nombre admite máximo 20 caracteres.
-- ------------------------------------------------------------
INSERT INTO area (id, nombre, padre_id, esta_activo, fecha_creacion, fecha_actualizacion) VALUES
  ('20000000-0000-4000-8000-000000000001', 'Desarrollo Web', NULL, TRUE, CURRENT_DATE, CURRENT_DATE),
  ('20000000-0000-4000-8000-000000000002', 'DevOps', NULL, TRUE, CURRENT_DATE, CURRENT_DATE),
  ('20000000-0000-4000-8000-000000000003', 'Bases de Datos', NULL, TRUE, CURRENT_DATE, CURRENT_DATE),
  ('20000000-0000-4000-8000-000000000004', 'Ciencia de Datos', NULL, TRUE, CURRENT_DATE, CURRENT_DATE),
  ('20000000-0000-4000-8000-000000000005', 'Ciberseguridad', NULL, TRUE, CURRENT_DATE, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO area (id, nombre, padre_id, esta_activo, fecha_creacion, fecha_actualizacion) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Node.js', '20000000-0000-4000-8000-000000000001', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111112', 'React', '20000000-0000-4000-8000-000000000001', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111113', 'Angular', '20000000-0000-4000-8000-000000000001', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111121', 'Docker', '20000000-0000-4000-8000-000000000002', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111122', 'Kubernetes', '20000000-0000-4000-8000-000000000002', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111123', 'CI/CD', '20000000-0000-4000-8000-000000000002', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111131', 'PostgreSQL', '20000000-0000-4000-8000-000000000003', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111132', 'MongoDB', '20000000-0000-4000-8000-000000000003', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111141', 'Python', '20000000-0000-4000-8000-000000000004', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111142', 'Machine Learning', '20000000-0000-4000-8000-000000000004', TRUE, CURRENT_DATE, CURRENT_DATE),
  ('11111111-1111-4111-8111-111111111151', 'Pentesting', '20000000-0000-4000-8000-000000000005', TRUE, CURRENT_DATE, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 6. Usuarios de demostración
--    usuario.usuario_id no tiene DEFAULT: el UUID se indica siempre.
-- ------------------------------------------------------------
INSERT INTO usuario (usuario_id, nombre, rol) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Panificadora San Jose', 'EMPRESA'),
  ('00000000-0000-4000-8000-000000000006', 'Carlos Méndez Rojas', 'titulado'),
  ('00000000-0000-4000-8000-000000000002', 'Jhoan López Vargas', 'administrador')
ON CONFLICT (usuario_id) DO NOTHING;

-- ------------------------------------------------------------
-- 7. Empresa demo (mismos IDs que supabase/seed.dev.sql y scripts/dev-token.js)
-- ------------------------------------------------------------
INSERT INTO empresa (id, id_usuario, razon_social, nit, descripcion, correo, sitio_web, fecha_registro) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Panificadora San Jose S.R.L.', '1023456019', 'Panaderia y reposteria de alta calidad en Cochabamba.', 'contacto@panificadorasanjose.com', 'https://www.panificadorasanjose.com', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO telefono_empresa (id, id_empresa, numero, tipo) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '+591 4 4251234', 'PRINCIPAL')
ON CONFLICT (id) DO NOTHING;

INSERT INTO direccion_empresa (id, id_empresa, departamento, direccion) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Cochabamba', 'Avenida San Martin #450, Zona Norte, Cochabamba, Bolivia')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 8. Mentor de pruebas (HU 6.1 a HU 6.4)
--    La elegibilidad de mentor exige titulado.id = <UUID del usuario>, así que
--    titulado y mentor comparten el mismo UUID del usuario de pruebas.
--    mentor.experiencia guarda el JSON que arma PATCH my-profile/information.
-- ------------------------------------------------------------
INSERT INTO titulado (id, id_usuario, nombre, apellido, cod_sis, id_carrera, ci, extension_ci, anio_ingreso, grado) VALUES
  ('00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006', 'Carlos', 'Méndez Rojas', 201712345, '10000000-0000-4000-8000-000000000001', '6543210', 'CB', 2017, 'Licenciatura')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mentor (id, experiencia, esta_activo, anios_exp, fecha_creacion, fecha_actualizacion) VALUES
  ('00000000-0000-4000-8000-000000000006', '{"descripcion":"Ingeniero de Sistemas especializado en arquitecturas backend.","experiencia":"Más de 6 años desarrollando APIs REST con Node.js y PostgreSQL.","informacion_relevante":"Disponible para sesiones de orientación los martes y jueves.","foto_perfil":null}', TRUE, 6, CURRENT_DATE, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mentor_area (id, id_mentor, id_area, fecha_creacion) VALUES
  ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000001', CURRENT_DATE),
  ('50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', CURRENT_DATE),
  ('50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', CURRENT_DATE),
  ('50000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111121', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Una sola fila por mentor: el servicio toma la más reciente si hay varias.
INSERT INTO disponibilidad_mentor (id, id_mentor, estado, fecha_creacion, fecha_actualizacion, hora_inicio, hora_fin) VALUES
  ('50000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000006', 'AVAILABLE', CURRENT_DATE, CURRENT_DATE, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 9. Administradores (padres de dictamen, reporte y encuesta)
-- ------------------------------------------------------------
INSERT INTO administrador_sistema (id, id_carrera) VALUES
  ('90000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO administrador_de_carrera (id, id_usuario, id_carrera, estado, fecha_registro) VALUES
  ('90000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Activo', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 10. Vacantes de la empresa demo (POST /api/vacantes)
--     estado 'PUBLICADO' es el literal que escribe la API.
-- ------------------------------------------------------------
INSERT INTO vacante (id, id_empresa, titulo, salario, modalidad, estado, created_at) VALUES
  ('30000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Desarrollador Backend Junior', 4500.00, 'HIBRIDO', 'PUBLICADO', NOW()),
  ('30000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Analista de Datos', 5200.00, 'REMOTO', 'PUBLICADO', NOW())
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 11. Eventos (POST /api/events)
--     La API guarda estado en minúsculas y el catálogo público muestra los
--     publicados con fecha_fin futura; por eso las fechas se calculan desde
--     NOW() para que el demo nunca expire.
-- ------------------------------------------------------------
INSERT INTO evento (id, id_usuario, titulo, descripcion, fecha_inicio, fecha_fin, cupo_maximo, ubicacion, estado, imagen_url, fecha_creacion) VALUES
  ('31000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Charla: Cloud para titulados', 'Introducción a servicios en la nube y buenas prácticas de despliegue.', NOW() + INTERVAL '12 days', NOW() + INTERVAL '12 days' + INTERVAL '2 hours', 40, 'Auditorio Facultad de Ciencias y Tecnología', 'publicado', NULL, NOW()),
  ('31000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Taller de entrevistas técnicas', 'Simulacros de entrevista y revisión de CV con mentores de la comunidad.', NOW() + INTERVAL '20 days', NOW() + INTERVAL '20 days' + INTERVAL '3 hours', 25, 'Aula Magna de Sistemas', 'publicado', NULL, NOW()),
  ('31000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'Feria de empleo UMSS 2026', 'Borrador de la feria anual con empresas de tecnología.', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days' + INTERVAL '6 hours', 120, 'Cancha central UMSS', 'borrador', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 12. Solicitudes de titulación (épica 8: bandeja de validación y reportes)
--     Mezcla de estados y antigüedades: una pendiente vencida (más de 48 h),
--     una reciente, observadas, aprobadas y rechazadas.
--     NO usar estos ci / correo / cod_sis para registrar una solicitud nueva
--     (la validación de duplicados los rechazaría).
-- ------------------------------------------------------------
INSERT INTO detalle_solicitud (id, id_carrera, nombre, apellido, telefono, email, fecha_titulacion, fecha_ingreso, ci, extension_ci, anio_egreso, cod_sis, desea_mentor) VALUES
  ('41000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Ana', 'Torres Rojas', '71234567', 'ana.torres.demo@gmail.com', '2021-06-15', '2016-03-01', '71234567', 'CB', 2021, 201904511, TRUE),
  ('41000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Marco', 'Antonio Villarroel', '76543210', 'marco.villarroel.demo@umss.edu.bo', '2019-11-20', '2014-08-01', '6987654', 'LP', 2019, 201602201, FALSE),
  ('41000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Lucía', 'Fernández Pinto', '70112233', 'lucia.fernandez.demo@outlook.com', '2022-07-08', '2017-08-01', '8456123', 'SC', 2022, 201903311, TRUE),
  ('41000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'René', 'Calvo Quiroga', '77553311', 'rene.calvo.demo@gmail.com', '2018-05-30', '2013-08-01', '5632147', 'TJ', 2018, 201501123, FALSE),
  ('41000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', 'Fabiola', 'Aguilar Soto', '70998877', 'fabiola.aguilar.demo@gmail.com', '2023-06-20', '2018-08-01', '9123456', 'CB', 2023, 202001122, TRUE),
  ('41000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 'Diego', 'Vargas Camacho', '72884411', 'diego.vargas.demo@umss.edu.bo', '2020-12-11', '2015-08-01', '7456123', 'PT', 2020, 201703345, FALSE),
  ('41000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002', 'Paola', 'Ríos Fernández', '76112244', 'paola.rios.demo@gmail.com', '2021-08-27', '2016-08-01', '6321458', 'OR', 2021, 201802233, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO documento_respaldo (id, id_tipo_archivo, tamanio_mb, ruta_storage, fecha_creacion, es_valido) VALUES
  ('42000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000001', 2, 'solicitudes/demo/ana-torres.pdf', NOW() - INTERVAL '5 hours', FALSE),
  ('42000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000001', 3, 'solicitudes/demo/marco-villarroel.pdf', NOW() - INTERVAL '72 hours', FALSE),
  ('42000000-0000-4000-8000-000000000003', '21000000-0000-4000-8000-000000000001', 2, 'solicitudes/demo/lucia-fernandez.pdf', NOW() - INTERVAL '30 hours', TRUE),
  ('42000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000001', 4, 'solicitudes/demo/rene-calvo.pdf', NOW() - INTERVAL '100 hours', TRUE),
  ('42000000-0000-4000-8000-000000000005', '21000000-0000-4000-8000-000000000001', 2, 'solicitudes/demo/fabiola-aguilar.pdf', NOW() - INTERVAL '120 hours', TRUE),
  ('42000000-0000-4000-8000-000000000006', '21000000-0000-4000-8000-000000000001', 3, 'solicitudes/demo/diego-vargas.pdf', NOW() - INTERVAL '150 hours', TRUE),
  ('42000000-0000-4000-8000-000000000007', '21000000-0000-4000-8000-000000000001', 2, 'solicitudes/demo/paola-rios.pdf', NOW() - INTERVAL '160 hours', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO solicitud (id, id_detalle_solicitud, id_documento_respaldo, estado, fecha_creacion) VALUES
  ('43000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', '42000000-0000-4000-8000-000000000001', 'Pendiente', NOW() - INTERVAL '5 hours'),
  ('43000000-0000-4000-8000-000000000002', '41000000-0000-4000-8000-000000000002', '42000000-0000-4000-8000-000000000002', 'Pendiente', NOW() - INTERVAL '72 hours'),
  ('43000000-0000-4000-8000-000000000003', '41000000-0000-4000-8000-000000000003', '42000000-0000-4000-8000-000000000003', 'OBSERVED', NOW() - INTERVAL '30 hours'),
  ('43000000-0000-4000-8000-000000000004', '41000000-0000-4000-8000-000000000004', '42000000-0000-4000-8000-000000000004', 'APPROVED', NOW() - INTERVAL '100 hours'),
  ('43000000-0000-4000-8000-000000000005', '41000000-0000-4000-8000-000000000005', '42000000-0000-4000-8000-000000000005', 'REJECTED', NOW() - INTERVAL '120 hours'),
  ('43000000-0000-4000-8000-000000000006', '41000000-0000-4000-8000-000000000006', '42000000-0000-4000-8000-000000000006', 'verificado', NOW() - INTERVAL '150 hours'),
  ('43000000-0000-4000-8000-000000000007', '41000000-0000-4000-8000-000000000007', '42000000-0000-4000-8000-000000000007', 'observado', NOW() - INTERVAL '160 hours')
ON CONFLICT (id) DO NOTHING;

-- Dictámenes de las solicitudes ya resueltas (misma forma que escribe la API:
-- categoría y nota separadas por una línea en blanco).
INSERT INTO dictamen (id, id_administrador_sistema, id_solicitud, justificacion, fecha_creacion, fecha_actualizacion, subsanada) VALUES
  ('44000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000003', 'DOCUMENTO ILEGIBLE

El documento adjunto no permite verificar el sello de la facultad.', NOW() - INTERVAL '20 hours', CURRENT_DATE, FALSE),
  ('44000000-0000-4000-8000-000000000002', '90000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000004', 'DOCUMENTO VÁLIDO

Toda la documentación está completa y legible.', NOW() - INTERVAL '90 hours', CURRENT_DATE, FALSE),
  ('44000000-0000-4000-8000-000000000003', '90000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000005', 'DATOS NO COINCIDEN

El nombre del documento no coincide con el registrado.', NOW() - INTERVAL '110 hours', CURRENT_DATE, FALSE)
ON CONFLICT (id) DO NOTHING;

COMMIT;
