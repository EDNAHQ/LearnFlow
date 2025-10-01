-- Create mental_model_images table
CREATE TABLE IF NOT EXISTS mental_model_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'not_generated' CHECK (status IN ('not_generated', 'generating', 'completed', 'failed')),
  error TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_mental_model_images_path_id ON mental_model_images(path_id);
CREATE INDEX idx_mental_model_images_status ON mental_model_images(status);
CREATE INDEX idx_mental_model_images_display_order ON mental_model_images(display_order);

-- Enable RLS
ALTER TABLE mental_model_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Mental model images are viewable by everyone"
  ON mental_model_images FOR SELECT
  USING (true);

CREATE POLICY "Mental model images can be inserted by authenticated users"
  ON mental_model_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Mental model images can be updated by authenticated users"
  ON mental_model_images FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Mental model images can be deleted by authenticated users"
  ON mental_model_images FOR DELETE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mental_model_images_updated_at
  BEFORE UPDATE ON mental_model_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing data from learning_paths JSON column to new table
DO $$
DECLARE
  path_record RECORD;
  image_record RECORD;
  image_order INTEGER;
BEGIN
  FOR path_record IN
    SELECT id, mental_model_images
    FROM learning_paths
    WHERE mental_model_images IS NOT NULL AND mental_model_images::text != '[]'
  LOOP
    image_order := 0;
    FOR image_record IN
      SELECT * FROM json_array_elements(path_record.mental_model_images::json)
    LOOP
      INSERT INTO mental_model_images (
        path_id,
        prompt,
        image_url,
        status,
        error,
        display_order,
        generated_at
      ) VALUES (
        path_record.id,
        image_record.value->>'prompt',
        image_record.value->>'imageUrl',
        COALESCE(image_record.value->>'status', 'not_generated'),
        image_record.value->>'error',
        image_order,
        CASE
          WHEN image_record.value->>'generatedAt' IS NOT NULL
          THEN (image_record.value->>'generatedAt')::timestamp with time zone
          ELSE NULL
        END
      );
      image_order := image_order + 1;
    END LOOP;
  END LOOP;
END $$;

-- Drop the old column from learning_paths (optional - comment out if you want to keep it as backup)
-- ALTER TABLE learning_paths DROP COLUMN IF EXISTS mental_model_images;