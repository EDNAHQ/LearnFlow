import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export interface PromptInsight {
  topic: string;
  frequency: number;
  category: string;
  samplePrompts: string[];
  hasPath: boolean;
  lastAsked: string;
}

export interface PromptInsights {
  insights: PromptInsight[];
  topCategories: { category: string; count: number }[];
  unansweredQuestions: PromptInsight[];
  suggestedTopics: string[];
}

export const usePromptInsights = () => {
  const [insights, setInsights] = useState<PromptInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session, loading: authLoading } = useAuth();
  const hasAuthenticatedRef = useRef(false);

  useEffect(() => {
    // Reset flag when auth state changes
    hasAuthenticatedRef.current = false;

    // Don't make requests while auth is loading
    if (authLoading) {
      setInsights(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If auth is loaded but no user/session, don't make any requests
    if (!user || !session || !session.access_token) {
      setInsights(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Mark as authenticated and proceed
    hasAuthenticatedRef.current = true;
    let cancelled = false;

    const fetchInsights = async () => {
      // Triple-check authentication before making the request
      if (cancelled || !hasAuthenticatedRef.current || !user || !session || !session.access_token) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Final check before API call
        if (!user || !session || !session.access_token) {
          setIsLoading(false);
          return;
        }

        // Explicitly pass auth headers to ensure they're included
        const { data, error: functionError } = await supabase.functions.invoke(
          'get-prompt-insights',
          {
            body: {},
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (cancelled || !hasAuthenticatedRef.current) return;

        if (functionError) {
          // Suppress 401 errors completely - they're expected when not authenticated
          const errorObj = functionError as any;
          const status = errorObj?.status || errorObj?.response?.status || errorObj?.context?.status;
          const message = errorObj?.message || '';
          const is401 = status === 401 || message.includes('401') || message.includes('Unauthorized');
          
          if (is401) {
            setInsights(null);
            setIsLoading(false);
            return;
          }
          console.error('Error fetching prompt insights:', functionError);
          setError(functionError as Error);
          return;
        }

        if (cancelled || !hasAuthenticatedRef.current) return;
        setInsights(data || null);
      } catch (err) {
        if (cancelled || !hasAuthenticatedRef.current) return;
        const error = err as any;
        // Suppress 401 errors completely
        if (error?.status === 401 || error?.message?.includes('401')) {
          setInsights(null);
          setIsLoading(false);
          return;
        }
        console.error('Error fetching prompt insights:', err);
        setError(err as Error);
      } finally {
        if (!cancelled && hasAuthenticatedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchInsights();

    return () => {
      cancelled = true;
      hasAuthenticatedRef.current = false;
    };
  }, [user, session, authLoading]);

  return { insights, isLoading, error };
};

