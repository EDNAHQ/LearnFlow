import { useCallback } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { getDiscoveryForPrompt } from '@/utils/personalization/discoveryMessages';

// Try to get discovery context, but don't fail if not available
let discoveryContext: { showDiscovery: (type: any, message: string, detail?: string) => void } | null = null;

export const setPromptDiscoveryContext = (context: typeof discoveryContext) => {
  discoveryContext = context;
};

export type PromptCategory = 
  | 'analysis' 
  | 'build' 
  | 'explanation' 
  | 'troubleshooting' 
  | 'ideation' 
  | 'coding' 
  | 'data_cleaning';

interface PromptLogParams {
  promptText: string;
  contextUsed?: string;
  category?: PromptCategory;
  pathId?: string;
  stepId?: string;
  sessionId?: string;
  responseLength?: number;
  userRating?: number;
  metadata?: Record<string, any>;
}

/**
 * Hook for tracking user prompts/requests
 * This captures the most honest signal of intent - what users are trying to learn RIGHT NOW
 */
export const usePromptTracking = () => {
  const { user } = useAuth();

  const logPrompt = useCallback(async (params: PromptLogParams) => {
    if (!user) return;

    try {
      // Auto-detect category if not provided
      const category = params.category || detectCategory(params.promptText);

      const { error } = await supabase
        .from('prompt_logs')
        .insert({
          user_id: user.id,
          prompt_text: params.promptText,
          context_used: params.contextUsed,
          category,
          path_id: params.pathId || null,
          step_id: params.stepId || null,
          session_id: params.sessionId,
          response_length: params.responseLength,
          user_rating: params.userRating,
          metadata: params.metadata || {}
        });

      if (error) {
        console.error('[usePromptTracking] Error logging prompt:', error);
      } else {
        // Try to show discovery notification
        try {
          const discovery = getDiscoveryForPrompt(params.promptText, category);
          if (discovery && discoveryContext) {
            discoveryContext.showDiscovery(discovery.type, discovery.message, discovery.detail);
          }
        } catch (err) {
          // Silently fail - discovery is optional
        }
      }
    } catch (error) {
      console.error('[usePromptTracking] Unexpected error:', error);
    }
  }, [user]);

  return {
    logPrompt
  };
};

/**
 * Simple category detection based on keywords
 * Can be enhanced with ML/NLP later
 */
function detectCategory(promptText: string): PromptCategory {
  const text = promptText.toLowerCase();
  
  if (text.includes('build') || text.includes('create') || text.includes('make')) {
    return 'build';
  }
  if (text.includes('explain') || text.includes('how') || text.includes('what')) {
    return 'explanation';
  }
  if (text.includes('error') || text.includes('fix') || text.includes('debug') || text.includes('problem')) {
    return 'troubleshooting';
  }
  if (text.includes('idea') || text.includes('suggest') || text.includes('recommend')) {
    return 'ideation';
  }
  if (text.includes('code') || text.includes('function') || text.includes('script')) {
    return 'coding';
  }
  if (text.includes('clean') || text.includes('transform') || text.includes('process')) {
    return 'data_cleaning';
  }
  if (text.includes('analyze') || text.includes('insight') || text.includes('pattern')) {
    return 'analysis';
  }
  
  return 'explanation'; // default
}

