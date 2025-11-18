-- Migration: Add default content preferences to user_profiles table
-- This enables users to set default content preferences that flow through to new projects

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS default_content_style TEXT CHECK (default_content_style IN ('conversational', 'formal', 'technical', 'storytelling', 'practical')),
ADD COLUMN IF NOT EXISTS default_content_length TEXT CHECK (default_content_length IN ('brief', 'standard', 'detailed', 'comprehensive')),
ADD COLUMN IF NOT EXISTS default_content_complexity TEXT CHECK (default_content_complexity IN ('simplified', 'balanced', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS default_preferred_examples TEXT CHECK (default_preferred_examples IN ('real-world', 'theoretical', 'code-focused', 'business-focused', 'mixed')),
ADD COLUMN IF NOT EXISTS default_learning_approach TEXT CHECK (default_learning_approach IN ('hands-on', 'conceptual', 'visual', 'analytical', 'balanced'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_default_content_style ON user_profiles(default_content_style);

