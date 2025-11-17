-- Migration: Create behavior_logs table for Phase 2 automatic tracking
-- Tracks user interactions, clicks, time on content, failures, etc.

CREATE TABLE IF NOT EXISTS behavior_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_type TEXT NOT NULL, -- 'click', 'search', 'module_open', 'hint_request', 'task_failure', 'task_success', 'content_view', 'content_complete'
  content_id TEXT,
  content_type TEXT, -- 'module', 'step', 'path', 'project', 'content'
  path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
  step_id UUID REFERENCES learning_steps(id) ON DELETE SET NULL,
  time_on_content INTEGER, -- seconds
  task_failure_count INTEGER DEFAULT 0,
  task_success_count INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb, -- flexible storage for additional context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_behavior_logs_user_id ON behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_timestamp ON behavior_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_action_type ON behavior_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_content_id ON behavior_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_path_id ON behavior_logs(path_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_step_id ON behavior_logs(step_id);

-- Enable RLS
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own behavior logs
CREATE POLICY "Users can view own behavior logs"
  ON behavior_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own behavior logs
CREATE POLICY "Users can insert own behavior logs"
  ON behavior_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

