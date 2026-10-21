-- 1. Borrar la columna proveedor_id si existe
ALTER TABLE public.correo_tramite 
DROP COLUMN IF EXISTS proveedor_id;

-- 2. Asegurar que TODAS las columnas existan antes de los CHECK e ÍNDICES
ALTER TABLE public.correo_tramite
    ADD COLUMN IF NOT EXISTS id_solicitud UUID,
    ADD COLUMN IF NOT EXISTS id_dictamen UUID,
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email_destino VARCHAR(320),
    ADD COLUMN IF NOT EXISTS asunto VARCHAR(200),
    ADD COLUMN IF NOT EXISTS cuerpo TEXT,
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente',
    ADD COLUMN IF NOT EXISTS intentos SMALLINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_intentos SMALLINT DEFAULT 3,
    ADD COLUMN IF NOT EXISTS siguiente_intento_en TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS ultimo_error TEXT,
    ADD COLUMN IF NOT EXISTS clave_evento VARCHAR(200),
    ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS fecha_ultimo_intento TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Agregar los CHECK constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'correo_tramite_tipo_check') THEN
        ALTER TABLE public.correo_tramite ADD CONSTRAINT correo_tramite_tipo_check CHECK (tipo IN ('recepcion','aprobacion','observacion','rechazo','otp','subsanacion','recuperacion'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'correo_tramite_estado_check') THEN
        ALTER TABLE public.correo_tramite ADD CONSTRAINT correo_tramite_estado_check CHECK (estado IN ('pendiente','procesando','enviada','fallida'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'correo_tramite_intentos_check') THEN
        ALTER TABLE public.correo_tramite ADD CONSTRAINT correo_tramite_intentos_check CHECK (intentos >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'correo_tramite_max_intentos_check') THEN
        ALTER TABLE public.correo_tramite ADD CONSTRAINT correo_tramite_max_intentos_check CHECK (max_intentos BETWEEN 1 AND 10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_correo_intentos_tope') THEN
        ALTER TABLE public.correo_tramite ADD CONSTRAINT ck_correo_intentos_tope CHECK (intentos <= max_intentos);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_correo_clave_evento_formato') THEN
        ALTER TABLE public.correo_tramite ADD CONSTRAINT ck_correo_clave_evento_formato CHECK (position(':' IN clave_evento) > 1);
    END IF;
END $$;

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_correo_cola
    ON public.correo_tramite(estado, siguiente_intento_en, created_at);
CREATE INDEX IF NOT EXISTS idx_correo_solicitud
    ON public.correo_tramite(id_solicitud, created_at DESC);

-- 5. Comentarios
COMMENT ON COLUMN public.correo_tramite.intentos IS
    'Contador dinamico de intentos de envio del correo.';
COMMENT ON COLUMN public.correo_tramite.max_intentos IS
    'Umbral configurable por fila (1 a 10, default 3); intentos <= max_intentos.';
COMMENT ON COLUMN public.correo_tramite.ultimo_error IS
    'Ultimo error del proveedor; util para reintentos inteligentes y diagnostico.';
COMMENT ON COLUMN public.correo_tramite.clave_evento IS
    'Identificador unico prefijo:identificador. UNIQUE aporta idempotencia.';