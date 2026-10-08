-- Conserva el tipo de empleo y las funciones descritas en el formulario
-- para que formulario, listado y detalle compartan los datos disponibles para
-- futuras HUs de matching de vacantes.
ALTER TABLE experiencia_laboral
  ADD COLUMN IF NOT EXISTS tipo_empleo VARCHAR(50) NOT NULL DEFAULT 'No especificado',
  ADD COLUMN IF NOT EXISTS descripcion TEXT NOT NULL DEFAULT '';
