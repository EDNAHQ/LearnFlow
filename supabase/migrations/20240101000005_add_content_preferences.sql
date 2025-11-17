-- Migration: Add content preferences to learning_paths table
-- This enables users to customize content style, length, and complexity per learning path

ALTER TABLE learning_paths
ADD COLUMN IF NOT EXISTS content_style TEXT CHECK (content_style IN ('conversational', 'formal', 'technical', 'storytelling', 'practical')),
ADD COLUMN IF NOT EXISTS content_length TEXT CHECK (content_length IN ('brief', 'standard', 'detailed', 'comprehensive')),
ADD COLUMN IF NOT EXISTS content_complexity TEXT CHECK (content_complexity IN ('simplified', 'balanced', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS preferred_examples TEXT CHECK (preferred_examples IN ('real-world', 'theoretical', 'code-focused', 'business-focused', 'mixed')),
ADD COLUMN IF NOT EXISTS learning_approach TEXT CHECK (learning_approach IN ('hands-on', 'conceptual', 'visual', 'analytical', 'balanced'));

-- Create index for faster queries on preferences
CREATE INDEX IF NOT EXISTS idx_learning_paths_content_style ON learning_paths(content_style);
CREATE INDEX IF NOT EXISTS idx_learning_paths_content_length ON learning_paths(content_length);

