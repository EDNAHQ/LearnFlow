import type { ModelConfig, FunctionType } from './types.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Centralized, code-first defaults
// Update DEFAULT_PRIMARY_MODEL to change the model across all function types in one place.
const DEFAULT_PRIMARY_MODEL = Deno.env.get('DEFAULT_AI_MODEL') || 'x-ai/grok-code-fast-1';

// Optional: centralized fallback model (some function types may override)
const DEFAULT_FALLBACK_MODEL = Deno.env.get('FALLBACK_AI_MODEL') || 'openai/gpt-4o-mini';

// If AI_CONFIG_SOURCE is set to 'db', we will load from the database; otherwise we use code config.
const AI_CONFIG_SOURCE = (Deno.env.get('AI_CONFIG_SOURCE') || 'code').toLowerCase();

// Code configuration used by default (and as fallback if DB fetch fails)
const FALLBACK_CONFIG: Record<FunctionType, ModelConfig> = {
  'content-generation': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 2500,
    fallbackModel: DEFAULT_FALLBACK_MODEL,
    temperature: 0.7,
  },
  'quick-insights': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 500,
    fallbackModel: DEFAULT_FALLBACK_MODEL,
    temperature: 0.7,
  },
  'deep-analysis': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 2000,
    fallbackModel: 'openai/gpt-4o',
    temperature: 0.7,
  },
  'structured-extraction': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 1000,
    fallbackModel: DEFAULT_FALLBACK_MODEL,
    temperature: 0.2,
  },
  'related-topics': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 800,
    fallbackModel: DEFAULT_FALLBACK_MODEL,
    temperature: 0.7,
  },
  'chat-tutor': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 1500,
    fallbackModel: DEFAULT_FALLBACK_MODEL,
    temperature: 0.8,
  },
  'topic-recommendations': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 1000,
    fallbackModel: DEFAULT_FALLBACK_MODEL,
    temperature: 0.7,
  },
};

// Get site information from environment
export const SITE_CONFIG = {
  url: Deno.env.get('SITE_URL') || 'https://learnflow.app',
  name: Deno.env.get('SITE_NAME') || 'LearnFlow',
};

// Cache for config to avoid DB hits on every request
let configCache: Record<FunctionType, ModelConfig> | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get AI model configuration for a function type.
 * Tries to load from database first, falls back to hardcoded config.
 * Results are cached for 5 minutes to reduce DB calls.
 */
export async function getAIConfig(functionType: FunctionType): Promise<ModelConfig> {
  // If configured for code-first, return immediately from the code config
  if (AI_CONFIG_SOURCE === 'code') {
    return FALLBACK_CONFIG[functionType];
  }

  // Return from cache if valid
  if (configCache && Date.now() < cacheExpiry) {
    return configCache[functionType];
  }

  // Try to load from database
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('ai_model_config')
        .select('*');

      if (!error && data && data.length > 0) {
        // Build config from DB data
        const dbConfig: Record<string, ModelConfig> = {};
        for (const row of data) {
          dbConfig[row.function_type] = {
            provider: row.provider,
            model: row.model,
            maxTokens: row.max_tokens,
            fallbackModel: row.fallback_model,
            temperature: row.temperature,
          };
        }

        // Update cache
        configCache = dbConfig as Record<FunctionType, ModelConfig>;
        cacheExpiry = Date.now() + CACHE_TTL;

        console.log(`Loaded AI config from database for ${functionType}: ${dbConfig[functionType]?.model}`);
        return configCache[functionType];
      }
    }
  } catch (error) {
    console.warn('Failed to load AI config from database, using fallback:', error);
  }

  // Fall back to hardcoded config
  console.log(`Using fallback AI config for ${functionType}`);
  return FALLBACK_CONFIG[functionType];
}

/**
 * Clear the config cache (useful for testing or forcing a refresh)
 */
export function clearConfigCache() {
  configCache = null;
  cacheExpiry = 0;
}