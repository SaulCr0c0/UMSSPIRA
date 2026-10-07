INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-solicitud', 'documentos-solicitud', false)
ON CONFLICT (id) DO NOTHING;