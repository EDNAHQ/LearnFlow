-- Create storage bucket for presentation images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'presentation_images',
  'presentation_images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create RLS policies for the bucket
CREATE POLICY "Public read access for presentation images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'presentation_images');

CREATE POLICY "Authenticated users can upload presentation images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'presentation_images' AND auth.role() = 'authenticated');

CREATE POLICY "Service role can manage presentation images"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'presentation_images' AND auth.role() = 'service_role');