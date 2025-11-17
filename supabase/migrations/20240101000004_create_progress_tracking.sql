-- Migration: Create progress_tracking table for learning progress and difficulty adaptation
-- Tracks completion times, difficulty ratings, success rates, and remediation needs

CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  step_id UUID REFERENCES learning_steps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completion_time INTEGER, -- seconds
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5), -- user's perception
  system_difficulty_rating INTEGER CHECK (system_difficulty_rating >= 1 AND system_difficulty_rating <= 5), -- system's assessment
  success_rate DECIMAL(5,2), -- percentage (0-100)
  remediation_needed BOOLEAN DEFAULT FALSE,
  attempts_count INTEGER DEFAULT 1,
  hints_requested INTEGER DEFAULT 0,
  examples_viewed INTEGER DEFAULT 0,
  skipped BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_module_id ON progress_tracking(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_step_id ON progress_tracking(step_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_completed_at ON progress_tracking(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_remediation_needed ON progress_tracking(remediation_needed) WHERE remediation_needed = TRUE;

-- Enable RLS
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON progress_tracking FOR UPDATE
  USING (auth.uid() = user_id);

