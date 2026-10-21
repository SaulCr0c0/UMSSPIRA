
BEGIN;

CREATE TABLE IF NOT EXISTS public.correo_tramite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_solicitud UUID NOT NULL REFERENCES public.solicitud(id) ON DELETE CASCADE,
    id_dictamen UUID REFERENCES public.dictamen(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN (
        'recepcion','aprobacion','observacion','rechazo','otp',
        'subsanacion','recuperacion'
    )),
    email_destino VARCHAR(320) NOT NULL,
    asunto VARCHAR(200),
    cuerpo TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','procesando','enviada','fallida')),
    intentos SMALLINT NOT NULL DEFAULT 0 CHECK (intentos >= 0),
    max_intentos SMALLINT NOT NULL DEFAULT 3 CHECK (max_intentos BETWEEN 1 AND 10),
    siguiente_intento_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultimo_error TEXT,
    clave_evento VARCHAR(200) NOT NULL UNIQUE,
    fecha_envio TIMESTAMPTZ,
    fecha_ultimo_intento TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_correo_intentos_tope CHECK (intentos <= max_intentos),
    CONSTRAINT ck_correo_clave_evento_formato
        CHECK (position(':' IN clave_evento) > 1)
);

CREATE INDEX IF NOT EXISTS idx_correo_cola
    ON public.correo_tramite(estado, siguiente_intento_en, created_at);
CREATE INDEX IF NOT EXISTS idx_correo_solicitud
    ON public.correo_tramite(id_solicitud, created_at DESC);

COMMENT ON COLUMN public.correo_tramite.intentos IS
    'Contador dinamico de intentos de envio del correo.';
COMMENT ON COLUMN public.correo_tramite.max_intentos IS
    'Umbral configurable por fila (1 a 10, default 3); intentos <= max_intentos.';
COMMENT ON COLUMN public.correo_tramite.ultimo_error IS
    'Ultimo error del proveedor; util para reintentos inteligentes y diagnostico.';
COMMENT ON COLUMN public.correo_tramite.clave_evento IS
    'Identificador unico prefijo:identificador. UNIQUE aporta idempotencia.';

COMMIT;