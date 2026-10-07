-- 0003_ajuste_dictamen.sql
-- Agrega tipo y categoria a dictamen (HU-04)

ALTER TABLE dictamen
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(20)
    CHECK (tipo IN ('APROBADO', 'OBSERVADO', 'RECHAZADO'));

ALTER TABLE dictamen
    ADD COLUMN IF NOT EXISTS categoria VARCHAR(50)
    CHECK (
        categoria IS NULL
        OR categoria IN (
            'DATOS_INCORRECTOS', 'DOC_ILEGIBLE', 'DOC_VENCIDO',
            'DOC_NO_CORRESPONDE', 'FALTA_FIRMA_SELLO',
            'INFO_NO_COINCIDE', 'OTRO'
        )
    );