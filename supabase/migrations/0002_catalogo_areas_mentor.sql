ALTER TABLE public.area
  ALTER COLUMN nombre TYPE VARCHAR(120);

ALTER TABLE public.area
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

WITH catalogo(nombre, descripcion) AS (
  VALUES
    ('Desarrollo web', 'Frontend, backend y UX/UI.'),
    ('Desarrollo móvil', 'Android, iOS, Flutter y React Native.'),
    ('Arquitectura y diseño de software', 'Patrones, microservicios y diseño de sistemas.'),
    ('Bases de datos', 'Modelado, SQL, NoSQL y optimización.'),
    ('Ciencia de datos e IA', 'Analítica, machine learning, NLP y visión por computador.'),
    ('Ciberseguridad', 'Seguridad de aplicaciones y redes, y hacking ético.'),
    ('Computación en la nube', 'AWS, Azure, GCP, despliegue y servicios cloud.'),
    ('DevOps', 'CI/CD, Docker y automatización de infraestructura.'),
    ('Redes y telecomunicaciones', 'Configuración, protocolos y administración.'),
    ('Calidad de software y testing', 'Pruebas manuales y automatizadas, y QA.'),
    ('Gestión de proyectos TI y desarrollo profesional', 'Metodologías ágiles, análisis de sistemas, CV, entrevistas técnicas y portafolio.')
)
INSERT INTO public.area (nombre, descripcion, esta_activo, fecha_creacion, fecha_actualizacion)
SELECT catalogo.nombre, catalogo.descripcion, TRUE, CURRENT_DATE, CURRENT_DATE
FROM catalogo
WHERE NOT EXISTS (
  SELECT 1
  FROM public.area existente
  WHERE lower(btrim(existente.nombre)) = lower(btrim(catalogo.nombre))
);

WITH catalogo(nombre, descripcion) AS (
  VALUES
    ('Desarrollo web', 'Frontend, backend y UX/UI.'),
    ('Desarrollo móvil', 'Android, iOS, Flutter y React Native.'),
    ('Arquitectura y diseño de software', 'Patrones, microservicios y diseño de sistemas.'),
    ('Bases de datos', 'Modelado, SQL, NoSQL y optimización.'),
    ('Ciencia de datos e IA', 'Analítica, machine learning, NLP y visión por computador.'),
    ('Ciberseguridad', 'Seguridad de aplicaciones y redes, y hacking ético.'),
    ('Computación en la nube', 'AWS, Azure, GCP, despliegue y servicios cloud.'),
    ('DevOps', 'CI/CD, Docker y automatización de infraestructura.'),
    ('Redes y telecomunicaciones', 'Configuración, protocolos y administración.'),
    ('Calidad de software y testing', 'Pruebas manuales y automatizadas, y QA.'),
    ('Gestión de proyectos TI y desarrollo profesional', 'Metodologías ágiles, análisis de sistemas, CV, entrevistas técnicas y portafolio.')
)
UPDATE public.area existente
SET descripcion = catalogo.descripcion
FROM catalogo
WHERE lower(btrim(existente.nombre)) = lower(btrim(catalogo.nombre))
  AND existente.descripcion IS NULL;

DELETE FROM public.mentor_area duplicado
USING public.mentor_area conservado
WHERE duplicado.id_mentor = conservado.id_mentor
  AND duplicado.id_area = conservado.id_area
  AND duplicado.id > conservado.id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_mentor_area_mentor_area
  ON public.mentor_area (id_mentor, id_area);

CREATE OR REPLACE FUNCTION public.save_mentor_areas(p_mentor_id UUID, p_area_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  selected_ids UUID[] := COALESCE(p_area_ids, ARRAY[]::UUID[]);
  active_count INTEGER;
BEGIN
  PERFORM 1
  FROM public.mentor
  WHERE id = p_mentor_id AND esta_activo IS TRUE
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El perfil de mentor no está habilitado';
  END IF;

  IF cardinality(selected_ids) > 5
    OR cardinality(selected_ids) <> (
      SELECT count(DISTINCT selected_id)
      FROM unnest(selected_ids) AS selected(selected_id)
    ) THEN
    RAISE EXCEPTION 'La selección debe contener como máximo cinco áreas únicas';
  END IF;

  SELECT count(*) INTO active_count
  FROM public.area
  WHERE id = ANY(selected_ids) AND esta_activo IS TRUE;
  IF active_count <> cardinality(selected_ids) THEN
    RAISE EXCEPTION 'La selección contiene áreas inexistentes o inactivas';
  END IF;

  DELETE FROM public.mentor_area WHERE id_mentor = p_mentor_id;
  INSERT INTO public.mentor_area (id_mentor, id_area, fecha_creacion)
  SELECT p_mentor_id, selected_id, CURRENT_DATE
  FROM unnest(selected_ids) AS selected(selected_id);
END;
$$;

REVOKE ALL ON FUNCTION public.save_mentor_areas(UUID, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_mentor_areas(UUID, UUID[]) TO service_role;
