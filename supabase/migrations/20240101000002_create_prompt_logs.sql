-- Migration: Create prompt_logs table for tracking user prompts/requests
-- This captures what users are trying to learn RIGHT NOW - the most honest signal of intent

CREATE TABLE IF NOT EXISTS prompt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prompt_text TEXT NOT NULL,
  context_used TEXT, -- what context was provided with the prompt
  category TEXT, -- 'analysis', 'build', 'explanation', 'troubleshooting', 'ideation', 'coding', 'data_cleaning'
  path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
  step_id UUID REFERENCES learning_steps(id) ON DELETE SET NULL,
  session_id UUID, -- link to learning session if applicable
  response_length INTEGER, -- length of AI response
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5), -- optional user feedback
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_logs_user_id ON prompt_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_logs_timestamp ON prompt_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_logs_category ON prompt_logs(category);
CREATE INDEX IF NOT EXISTS idx_prompt_logs_path_id ON prompt_logs(path_id);
CREATE INDEX IF NOT EXISTS idx_prompt_logs_step_id ON prompt_logs(step_id);

-- Full text search index for prompt text
CREATE INDEX IF NOT EXISTS idx_prompt_logs_prompt_text_fts ON prompt_logs USING gin(to_tsvector('english', prompt_text));

-- Enable RLS
ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own prompt logs
CREATE POLICY "Users can view own prompt logs"
  ON prompt_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own prompt logs
CREATE POLICY "Users can insert own prompt logs"
  ON prompt_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

