-- ============================================================
-- 0006_create_fun_registrar_solicitud.sql
-- Registra una nueva solicitud completa con validaciones
-- ============================================================

CREATE OR REPLACE FUNCTION fun_registrar_solicitud(
    -- Datos personales
    p_id_carrera        UUID,
    p_nombre            VARCHAR(45),
    p_apellido          VARCHAR(45),
    p_telefono          VARCHAR(20),
    p_email             VARCHAR(255),
    p_fecha_titulacion  DATE,
    p_fecha_ingreso     DATE,
    p_ci                VARCHAR(20),
    p_extension_ci      VARCHAR(20),
    p_anio_egreso       SMALLINT,
    p_cod_sis           NUMERIC,
    p_desea_mentor      BOOLEAN,
    -- Documento
    p_id_tipo_archivo   UUID,
    p_tamanio_mb        INTEGER,
    p_ruta_storage      TEXT,
    -- Usuario que registra (obligatorio aquí)
    p_id_usuario        UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_solicitud   UUID;
    v_estado         VARCHAR(20) := 'PENDIENTE';
BEGIN
    -- ========================================================
    -- 1. VALIDACIONES DE NEGOCIO
    -- ========================================================

    -- Usuario obligatorio
    IF p_id_usuario IS NULL THEN
        RAISE EXCEPTION 'El usuario es obligatorio para registrar una solicitud'
            USING ERRCODE = '22004';
    END IF;

    -- Usuario existe
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE usuario_id = p_id_usuario) THEN
        RAISE EXCEPTION 'El usuario % no existe', p_id_usuario
            USING ERRCODE = '23503';
    END IF;

    -- No tener ya una solicitud activa
    IF existe_solicitud_activa(p_id_usuario) THEN
        RAISE EXCEPTION 'El usuario ya tiene una solicitud en proceso'
            USING ERRCODE = '23505';
    END IF;

    -- Carrera válida
    IF p_id_carrera IS NULL OR NOT EXISTS (
        SELECT 1 FROM carrera WHERE id = p_id_carrera
    ) THEN
        RAISE EXCEPTION 'La carrera % no existe', p_id_carrera
            USING ERRCODE = '23503';
    END IF;

    -- Tipo de archivo válido
    IF p_id_tipo_archivo IS NULL OR NOT EXISTS (
        SELECT 1 FROM tipo_archivo WHERE id = p_id_tipo_archivo
    ) THEN
        RAISE EXCEPTION 'El tipo de archivo % no existe', p_id_tipo_archivo
            USING ERRCODE = '23503';
    END IF;

    -- Campos obligatorios básicos
    IF p_ci IS NULL OR TRIM(p_ci) = '' THEN
        RAISE EXCEPTION 'El CI es obligatorio' USING ERRCODE = '23502';
    END IF;

    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RAISE EXCEPTION 'El email es obligatorio' USING ERRCODE = '23502';
    END IF;

    -- Validación simple de email
    IF p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
        RAISE EXCEPTION 'El email % no tiene un formato válido', p_email
            USING ERRCODE = '22023';
    END IF;

    -- Año de egreso coherente
    IF p_anio_egreso IS NOT NULL AND (
        p_anio_egreso < 1950 OR p_anio_egreso > EXTRACT(YEAR FROM CURRENT_DATE)
    ) THEN
        RAISE EXCEPTION 'El año de egreso % no es válido', p_anio_egreso
            USING ERRCODE = '22023';
    END IF;

    -- ========================================================
    -- 2. PERSISTENCIA (delegada a fun_crear_solicitud)
    -- ========================================================
    v_id_solicitud := fun_crear_solicitud(
        p_id_carrera       := p_id_carrera,
        p_nombre           := p_nombre,
        p_apellido         := p_apellido,
        p_telefono         := p_telefono,
        p_email            := p_email,
        p_fecha_titulacion := p_fecha_titulacion,
        p_fecha_ingreso    := p_fecha_ingreso,
        p_ci               := p_ci,
        p_extension_ci     := p_extension_ci,
        p_anio_egreso      := p_anio_egreso,
        p_cod_sis          := p_cod_sis,
        p_desea_mentor     := p_desea_mentor,
        p_id_tipo_archivo  := p_id_tipo_archivo,
        p_tamanio_mb       := p_tamanio_mb,
        p_ruta_storage     := p_ruta_storage,
        p_es_valido        := TRUE,
        p_estado           := v_estado,
        p_id_usuario       := p_id_usuario
    );

    -- ========================================================
    -- 3. RESULTADO ESTRUCTURADO
    -- ========================================================
    RETURN jsonb_build_object(
        'ok',            TRUE,
        'id_solicitud',  v_id_solicitud,
        'estado',        v_estado,
        'mensaje',       'Solicitud registrada correctamente'
    );

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Ya existe una solicitud activa para este usuario'
            USING ERRCODE = '23505';
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Referencia inválida: %', SQLERRM
            USING ERRCODE = '23503';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al registrar solicitud: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION fun_registrar_solicitud(
    UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, DATE,
    VARCHAR, VARCHAR, SMALLINT, NUMERIC, BOOLEAN,
    UUID, INTEGER, TEXT, UUID
) IS 'Registra una nueva solicitud completa con validaciones de negocio.';