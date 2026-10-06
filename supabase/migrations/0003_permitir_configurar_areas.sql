-- Permite guardar áreas para un usuario autenticado aunque su participación
-- como mentor todavía no esté habilitada. No activa la participación.
CREATE OR REPLACE FUNCTION public.save_mentor_areas(p_mentor_id UUID, p_area_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  selected_ids UUID[] := COALESCE(p_area_ids, ARRAY[]::UUID[]);
  active_count INTEGER;
BEGIN
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

  -- mentor_area requiere un registro padre; si aún no existe, se crea inactivo.
  INSERT INTO public.mentor (id, esta_activo, fecha_creacion, fecha_actualizacion)
  VALUES (p_mentor_id, FALSE, CURRENT_DATE, CURRENT_DATE)
  ON CONFLICT (id) DO NOTHING;

  DELETE FROM public.mentor_area WHERE id_mentor = p_mentor_id;
  INSERT INTO public.mentor_area (id_mentor, id_area, fecha_creacion)
  SELECT p_mentor_id, selected_id, CURRENT_DATE
  FROM unnest(selected_ids) AS selected(selected_id);
END;
$$;
