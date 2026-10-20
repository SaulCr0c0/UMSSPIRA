INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'event-covers',
  'event-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "event covers are publicly readable"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'event-covers');

CREATE POLICY "administrators manage their event covers"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'event-covers'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM public.usuario
      WHERE usuario_id = (SELECT auth.uid())
        AND lower(rol) IN ('administrador', 'admin')
    )
  )
  WITH CHECK (
    bucket_id = 'event-covers'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM public.usuario
      WHERE usuario_id = (SELECT auth.uid())
        AND lower(rol) IN ('administrador', 'admin')
    )
  );
