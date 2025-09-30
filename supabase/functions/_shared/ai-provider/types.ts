// Types for AI provider

export type FunctionType =
  | 'content-generation'
  | 'quick-insights'
  | 'deep-analysis'
  | 'structured-extraction';

export type Provider = 'openrouter' | 'openai';

export interface ModelConfig {
  provider: Provider;
  model: string;
  maxTokens: number;
  fallbackModel: string;
  temperature?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatParams {
  functionType: FunctionType;
  messages: ChatMessage[];
  responseFormat?: 'json_object' | 'text';
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: Provider;
  tokensUsed?: number;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}