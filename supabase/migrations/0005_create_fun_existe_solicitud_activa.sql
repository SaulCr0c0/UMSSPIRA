-- ============================================================
-- 0005_create_fun_existe_solicitud_activa.sql
-- Verifica si un usuario ya tiene una solicitud en curso
-- ============================================================

CREATE OR REPLACE FUNCTION fun_existe_solicitud_activa(
    p_id_usuario UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_existe BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM usuario_solicitud us
        INNER JOIN solicitud s ON s.id = us.id_solicitud
        WHERE us.id_usuario = p_id_usuario
          AND s.estado NOT IN ('APROBADA', 'RECHAZADA')
    )
    INTO v_existe;

    RETURN v_existe;
END;
$$;