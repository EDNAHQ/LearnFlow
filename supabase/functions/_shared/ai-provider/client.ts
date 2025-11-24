import OpenAI from "https://esm.sh/openai@4.28.0";
import { getAIConfig, SITE_CONFIG } from './config.ts';
import type { ChatParams, ChatResponse, OpenRouterResponse } from './types.ts';

export class AIClient {
  private openrouterApiKey: string;
  private openaiApiKey: string;
  private openaiClient: OpenAI;

  constructor() {
    this.openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY') || '';
    this.openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

    // Initialize OpenAI client as fallback
    this.openaiClient = new OpenAI({
      apiKey: this.openaiApiKey
    });
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    // Load config from database (or fallback to hardcoded)
    const config = await getAIConfig(params.functionType);
    const maxTokens = params.maxTokens || config.maxTokens;
    const temperature = params.temperature !== undefined ? params.temperature : config.temperature;

    console.log(`AI Request - Type: ${params.functionType}, Model: ${config.model}`);

    // Try primary model via OpenRouter
    try {
      const response = await this.callOpenRouter({
        model: config.model,
        messages: params.messages,
        maxTokens,
        temperature,
        responseFormat: params.responseFormat,
      });

      console.log(`Success with ${config.model} via OpenRouter`);
      return response;
    } catch (primaryError) {
      console.warn(`Primary model ${config.model} failed:`, primaryError);

      // Try fallback model via OpenRouter
      try {
        console.log(`Attempting fallback model: ${config.fallbackModel}`);
        const fallbackResponse = await this.callOpenRouter({
          model: config.fallbackModel,
          messages: params.messages,
          maxTokens,
          temperature,
          responseFormat: params.responseFormat,
        });

        console.log(`Success with fallback ${config.fallbackModel} via OpenRouter`);
        return fallbackResponse;
      } catch (fallbackError) {
        console.warn(`Fallback model ${config.fallbackModel} failed:`, fallbackError);

        // Final fallback: use direct OpenAI
        console.log('Falling back to direct OpenAI');
        return await this.callOpenAIDirect({
          model: config.fallbackModel.replace('openai/', ''), // Remove provider prefix
          messages: params.messages,
          maxTokens,
          temperature,
          responseFormat: params.responseFormat,
        });
      }
    }
  }

  private async callOpenRouter(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
    temperature?: number;
    responseFormat?: 'json_object' | 'text';
  }): Promise<ChatResponse> {
    if (!this.openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const body: any = {
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
    };

    if (params.temperature !== undefined) {
      body.temperature = params.temperature;
    }

    // Add response format for JSON requests
    if (params.responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };

      // Enhance prompts for JSON mode
      body.messages = params.messages.map((msg, idx) => {
        if (idx === 0 && msg.role === 'system') {
          return {
            ...msg,
            content: msg.content + "\n\nYOU MUST RESPOND WITH VALID JSON IN THE EXACT FORMAT SPECIFIED. Do not include markdown formatting, code blocks, or any text outside the JSON object. The response must be parseable by JSON.parse()."
          };
        }
        if (idx === params.messages.length - 1 && msg.role === 'user') {
          return {
            ...msg,
            content: msg.content + "\n\nIMPORTANT: Respond with ONLY a valid JSON object. No explanations, no markdown, just pure JSON."
          };
        }
        return msg;
      });
    }

    // Add timeout to fetch call using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    let response: Response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openrouterApiKey}`,
          'HTTP-Referer': SITE_CONFIG.url,
          'X-Title': SITE_CONFIG.name,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenRouter API request timed out after 60 seconds');
      }
      throw error;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenRouter');
    }

    let content = data.choices[0].message.content;

    // Validate and sanitize JSON if needed
    if (params.responseFormat === 'json_object') {
      content = this.validateAndSanitizeJSON(content);
    }

    return {
      content,
      model: data.model || params.model,
      provider: 'openrouter',
      tokensUsed: data.usage?.total_tokens,
    };
  }

  private async callOpenAIDirect(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
    temperature?: number;
    responseFormat?: 'json_object' | 'text';
  }): Promise<ChatResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const requestParams: any = {
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
    };

    if (params.temperature !== undefined) {
      requestParams.temperature = params.temperature;
    }

    if (params.responseFormat === 'json_object') {
      requestParams.response_format = { type: 'json_object' };

      // Enhance prompts for JSON mode
      requestParams.messages = params.messages.map((msg, idx) => {
        if (idx === 0 && msg.role === 'system') {
          return {
            ...msg,
            content: msg.content + "\n\nYOU MUST RESPOND WITH VALID JSON IN THE EXACT FORMAT SPECIFIED. Do not include markdown formatting, code blocks, or any text outside the JSON object. The response must be parseable by JSON.parse()."
          };
        }
        if (idx === params.messages.length - 1 && msg.role === 'user') {
          return {
            ...msg,
            content: msg.content + "\n\nIMPORTANT: Respond with ONLY a valid JSON object. No explanations, no markdown, just pure JSON."
          };
        }
        return msg;
      });
    }

    // Add timeout wrapper for OpenAI direct call
    const completionPromise = this.openaiClient.chat.completions.create(requestParams);
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out after 60 seconds')), 60000);
    });
    
    const completion = await Promise.race([completionPromise, timeoutPromise]);

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    let content = completion.choices[0].message.content || '';

    // Validate and sanitize JSON if needed
    if (params.responseFormat === 'json_object') {
      content = this.validateAndSanitizeJSON(content);
    }

    return {
      content,
      model: completion.model,
      provider: 'openai',
      tokensUsed: completion.usage?.total_tokens,
    };
  }

  private validateAndSanitizeJSON(content: string): string {
    if (!content || content.trim() === '') {
      throw new Error('Empty content received');
    }

    let sanitized = content.trim();

    // Extract JSON from possible markdown or text wrapper
    if (!sanitized.startsWith('{') && !sanitized.startsWith('[')) {
      const jsonMatch = sanitized.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        sanitized = jsonMatch[0];
        console.log('Extracted JSON object from response');
      }
    }

    // Try to parse to validate
    try {
      JSON.parse(sanitized);
      return sanitized;
    } catch (error) {
      console.error('JSON validation failed:', error);
      console.error('Problematic content:', sanitized.substring(0, 500));
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
  }
}

// Factory function to create AI client
export function createAIClient(): AIClient {
  return new AIClient();
}