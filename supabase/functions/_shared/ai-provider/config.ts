import type { ModelConfig, FunctionType } from './types.ts';

// Centralized, code-first defaults
// Update DEFAULT_PRIMARY_MODEL to change the model across all function types in one place.
const DEFAULT_PRIMARY_MODEL = Deno.env.get('DEFAULT_AI_MODEL') || 'x-ai/grok-code-fast-1';

// Optional: centralized fallback model (some function types may override)
const DEFAULT_FALLBACK_MODEL = Deno.env.get('FALLBACK_AI_MODEL') || 'openai/gpt-4o-mini';

// Code configuration - the single source of truth for AI models
const CODE_CONFIG: Record<FunctionType, ModelConfig> = {
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

/**
 * Get AI model configuration for a function type.
 * Always returns from code configuration - no database lookups.
 */
export async function getAIConfig(functionType: FunctionType): Promise<ModelConfig> {
  console.log(`Using code config for ${functionType}: ${CODE_CONFIG[functionType]?.model}`);
  return CODE_CONFIG[functionType];
}