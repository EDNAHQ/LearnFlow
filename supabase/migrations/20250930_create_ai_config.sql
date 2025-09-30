-- Create table for AI model configuration
CREATE TABLE IF NOT EXISTS ai_model_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_type text NOT NULL UNIQUE,
  provider text NOT NULL DEFAULT 'openrouter',
  model text NOT NULL,
  fallback_model text NOT NULL,
  max_tokens int NOT NULL DEFAULT 1500,
  temperature decimal(3,2) NOT NULL DEFAULT 0.7,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Insert default configurations
INSERT INTO ai_model_config (function_type, provider, model, fallback_model, max_tokens, temperature) VALUES
  ('content-generation', 'openrouter', 'deepseek/deepseek-chat-v3.1:free', 'openai/gpt-4o-mini', 1500, 0.7),
  ('quick-insights', 'openrouter', 'deepseek/deepseek-chat-v3.1:free', 'openai/gpt-4o-mini', 500, 0.7),
  ('deep-analysis', 'openrouter', 'deepseek/deepseek-chat-v3.1:free', 'openai/gpt-4o', 2000, 0.7),
  ('structured-extraction', 'openrouter', 'deepseek/deepseek-chat-v3.1:free', 'openai/gpt-4o-mini', 1000, 0.2)
ON CONFLICT (function_type) DO UPDATE SET
  model = EXCLUDED.model,
  fallback_model = EXCLUDED.fallback_model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  updated_at = now();

-- Add RLS policies (optional - if you want to manage via dashboard)
ALTER TABLE ai_model_config ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage config
CREATE POLICY "Allow service role full access" ON ai_model_config
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');