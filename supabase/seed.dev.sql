-- ============================================================
-- Datos de prueba para desarrollo (HU-02, HU-03, HU-04)
-- Se puede ejecutar varias veces: restaura la empresa de prueba.
-- IDs fijos: el token de desarrollo (scripts/dev-token.js) usa el mismo empresaId.
-- ============================================================
BEGIN;

INSERT INTO usuario (usuario_id, nombre, rol)
VALUES ('a0000000-0000-4000-8000-000000000001', 'Panificadora San Jose', 'EMPRESA')
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO empresa (
  id, id_usuario, razon_social, nit, descripcion, correo, sitio_web,
  fecha_registro, eslogan, logo_url, banner_url, tamano_empresa,
  descripcion_larga, fecha_actualizacion
)
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'Panificadora San Jose S.R.L.',
  '1023456019',
  'Panaderia y reposteria de alta calidad en Cochabamba.',
  'contacto@panificadorasanjose.com',
  'https://www.panificadorasanjose.com',
  NOW(),
  'Calidad y tradición para cada día.',
  NULL,
  NULL,
  '50-200 empleados',
  'Panificadora San Jose S.R.L. es una empresa dedicada a la elaboración y comercialización de productos de panadería y repostería de alta calidad, consolidada con más de 15 años de experiencia en el mercado local.',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  razon_social        = EXCLUDED.razon_social,
  nit                 = EXCLUDED.nit,
  descripcion         = EXCLUDED.descripcion,
  correo              = EXCLUDED.correo,
  sitio_web           = EXCLUDED.sitio_web,
  eslogan             = EXCLUDED.eslogan,
  logo_url            = EXCLUDED.logo_url,
  banner_url          = EXCLUDED.banner_url,
  tamano_empresa      = EXCLUDED.tamano_empresa,
  descripcion_larga   = EXCLUDED.descripcion_larga,
  fecha_actualizacion = NOW();

INSERT INTO telefono_empresa (id, id_empresa, numero, tipo)
VALUES (
  'c0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  '+591 4 4251234',
  'PRINCIPAL'
)
ON CONFLICT (id) DO UPDATE SET numero = EXCLUDED.numero;

INSERT INTO direccion_empresa (id, id_empresa, departamento, direccion)
VALUES (
  'd0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'Cochabamba',
  'Avenida San Martin #450, Zona Norte, Cochabamba, Bolivia'
)
ON CONFLICT (id) DO UPDATE SET direccion = EXCLUDED.direccion;

COMMIT;