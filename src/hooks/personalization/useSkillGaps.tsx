import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export interface SkillGap {
  skill: string;
  learned: boolean;
  demonstrated: boolean;
  timesLearned: number;
  timesDemonstrated: number;
  avgScore?: number;
  gapType: 'knowledge_gap' | 'application_gap' | 'mastery_gap';
}

export interface SkillGaps {
  gaps: SkillGap[];
  strengths: string[];
  opportunities: string[];
  recommendations: {
    topic: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export const useSkillGaps = () => {
  const [skillGaps, setSkillGaps] = useState<SkillGaps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session, loading: authLoading } = useAuth();
  const hasAuthenticatedRef = useRef(false);

  useEffect(() => {
    // Reset flag when auth state changes
    hasAuthenticatedRef.current = false;

    // Don't make requests while auth is loading
    if (authLoading) {
      setSkillGaps(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If auth is loaded but no user/session, don't make any requests
    if (!user || !session || !session.access_token) {
      setSkillGaps(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Mark as authenticated and proceed
    hasAuthenticatedRef.current = true;
    let cancelled = false;

    const fetchSkillGaps = async () => {
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
          'get-skill-gaps',
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
            setSkillGaps(null);
            setIsLoading(false);
            return;
          }
          console.error('Error fetching skill gaps:', functionError);
          setError(functionError as Error);
          return;
        }

        if (cancelled || !hasAuthenticatedRef.current) return;
        setSkillGaps(data || null);
      } catch (err) {
        if (cancelled || !hasAuthenticatedRef.current) return;
        const error = err as any;
        // Suppress 401 errors completely
        if (error?.status === 401 || error?.message?.includes('401')) {
          setSkillGaps(null);
          setIsLoading(false);
          return;
        }
        console.error('Error fetching skill gaps:', err);
        setError(err as Error);
      } finally {
        if (!cancelled && hasAuthenticatedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchSkillGaps();

    return () => {
      cancelled = true;
      hasAuthenticatedRef.current = false;
    };
  }, [user, session, authLoading]);

  return { skillGaps, isLoading, error };
};

