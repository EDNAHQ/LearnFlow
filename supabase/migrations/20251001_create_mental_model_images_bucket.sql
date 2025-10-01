-- Create the mental_model_images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mental_model_images',
  'mental_model_images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[];

-- Create RLS policies for the bucket
CREATE POLICY "Public read access for mental_model_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mental_model_images');

CREATE POLICY "Service role insert for mental_model_images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mental_model_images' AND auth.role() = 'service_role');

CREATE POLICY "Service role update for mental_model_images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'mental_model_images' AND auth.role() = 'service_role');

CREATE POLICY "Service role delete for mental_model_images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'mental_model_images' AND auth.role() = 'service_role');