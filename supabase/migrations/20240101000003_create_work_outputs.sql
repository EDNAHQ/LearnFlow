-- Migration: Create work_outputs table for Phase 3 capability assessment
-- This is the secret weapon - scoring real work outputs against skill rubrics

CREATE TABLE IF NOT EXISTS work_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project_type TEXT NOT NULL, -- 'dashboard', 'automation', 'code', 'agent', 'dataset', 'app_prototype', 'document'
  title TEXT NOT NULL,
  description TEXT,
  file_reference TEXT, -- path to uploaded file or reference
  file_url TEXT, -- URL if stored externally
  skill_tags_used TEXT[] DEFAULT '{}', -- array of skills demonstrated
  auto_score DECIMAL(5,2), -- automated assessment score (0-100)
  manual_score DECIMAL(5,2), -- manual review score (0-100)
  feedback_summary TEXT,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  time_to_complete INTEGER, -- minutes
  assessment_status TEXT DEFAULT 'pending' CHECK (assessment_status IN ('pending', 'auto_assessed', 'manually_reviewed', 'needs_review')),
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Link to learning path/step if created as part of learning
  path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
  step_id UUID REFERENCES learning_steps(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_outputs_user_id ON work_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_work_outputs_project_type ON work_outputs(project_type);
CREATE INDEX IF NOT EXISTS idx_work_outputs_created_at ON work_outputs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_outputs_assessment_status ON work_outputs(assessment_status);
CREATE INDEX IF NOT EXISTS idx_work_outputs_skill_tags ON work_outputs USING gin(skill_tags_used);

-- Enable RLS
ALTER TABLE work_outputs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own work outputs
CREATE POLICY "Users can view own work outputs"
  ON work_outputs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own work outputs
CREATE POLICY "Users can insert own work outputs"
  ON work_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own work outputs
CREATE POLICY "Users can update own work outputs"
  ON work_outputs FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_work_outputs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_work_outputs_updated_at
  BEFORE UPDATE ON work_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_work_outputs_updated_at();

