-- Migration: Extend user_profiles table with Phase 1 capability data
-- This adds the foundational data collection fields for personalization

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS function TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'competent', 'builder')),
ADD COLUMN IF NOT EXISTS current_tools TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS goals_short_term TEXT,
ADD COLUMN IF NOT EXISTS goals_long_term TEXT,
ADD COLUMN IF NOT EXISTS immediate_challenge TEXT,
ADD COLUMN IF NOT EXISTS business_context TEXT,
ADD COLUMN IF NOT EXISTS skill_data INTEGER CHECK (skill_data >= 1 AND skill_data <= 5),
ADD COLUMN IF NOT EXISTS skill_apps INTEGER CHECK (skill_apps >= 1 AND skill_apps <= 5),
ADD COLUMN IF NOT EXISTS skill_automation INTEGER CHECK (skill_automation >= 1 AND skill_automation <= 5),
ADD COLUMN IF NOT EXISTS skill_ai_reasoning INTEGER CHECK (skill_ai_reasoning >= 1 AND skill_ai_reasoning <= 5),
ADD COLUMN IF NOT EXISTS time_horizon TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience_level ON user_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON user_profiles(industry);

