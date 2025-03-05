
-- Add is_completed column to learning_paths table if it doesn't exist
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
