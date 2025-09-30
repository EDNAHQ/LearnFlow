-- Quick script to update AI models across all functions
-- Run this in Supabase SQL Editor to change models instantly (no redeployment needed!)

-- Update ALL functions to use deepseek-chat-v3.1:free
UPDATE ai_model_config
SET
  model = 'deepseek/deepseek-chat-v3.1:free',
  updated_at = now();

-- Or update specific function types:
/*
UPDATE ai_model_config
SET model = 'deepseek/deepseek-chat-v3.1:free'
WHERE function_type = 'content-generation';

UPDATE ai_model_config
SET model = 'anthropic/claude-3-haiku'
WHERE function_type = 'quick-insights';
*/

-- View current configuration
SELECT
  function_type,
  model,
  fallback_model,
  max_tokens,
  temperature,
  updated_at
FROM ai_model_config
ORDER BY function_type;