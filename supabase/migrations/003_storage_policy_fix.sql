DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'public-media'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('public-media', 'public-media', true);
  ELSE
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'public-media';
  END IF;
END $$;

DROP POLICY IF EXISTS "Public read public-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert public-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update public-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete public-media" ON storage.objects;

CREATE POLICY "Public read public-media"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'public-media');

CREATE POLICY "Authenticated insert public-media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-media');

CREATE POLICY "Authenticated update public-media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'public-media')
WITH CHECK (bucket_id = 'public-media');

CREATE POLICY "Authenticated delete public-media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'public-media');

