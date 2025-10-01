-- Add chat-tutor configuration to ai_model_config table
INSERT INTO ai_model_config (function_type, provider, model, fallback_model, max_tokens, temperature) VALUES
  ('chat-tutor', 'openrouter', 'deepseek/deepseek-chat-v3.1:free', 'openai/gpt-4o-mini', 1500, 0.8)
ON CONFLICT (function_type) DO UPDATE SET
  model = EXCLUDED.model,
  fallback_model = EXCLUDED.fallback_model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  updated_at = now();
