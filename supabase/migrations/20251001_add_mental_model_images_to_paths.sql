-- Remove mental_model_images from learning_steps (if it exists)
ALTER TABLE learning_steps DROP COLUMN IF EXISTS mental_model_images;

-- Add mental_model_images column to learning_paths table
ALTER TABLE learning_paths
ADD COLUMN IF NOT EXISTS mental_model_images JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN learning_paths.mental_model_images IS 'Array of mental model images for the entire learning path: [{prompt: string, imageUrl: string, status: string, generatedAt: timestamp}]';
