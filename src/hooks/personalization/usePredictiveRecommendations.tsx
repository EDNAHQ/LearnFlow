import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export interface PredictiveRecommendation {
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  signals: string[];
}

export const usePredictiveRecommendations = () => {
  const [recommendations, setRecommendations] = useState<PredictiveRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session, loading: authLoading } = useAuth();
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    // Don't make requests while auth is loading
    if (authLoading) {
      return;
    }

    // If auth is loaded but no user/session, clear state and don't make any requests
    if (!user || !session || !session.access_token) {
      // Only clear if we had data before (user logged out)
      if (hasFetchedRef.current !== null) {
        setRecommendations([]);
        setIsLoading(false);
        setError(null);
        hasFetchedRef.current = null;
      }
      return;
    }

    // Create a unique key for this user/session combination
    const fetchKey = `${user.id}-${session.access_token.substring(0, 20)}`;

    // Only fetch if we haven't fetched for this user/session yet
    if (hasFetchedRef.current === fetchKey) {
      return;
    }

    // Mark that we're fetching for this session
    hasFetchedRef.current = fetchKey;
    let cancelled = false;

    const fetchRecommendations = async () => {
      // Check if cancelled or session changed
      if (cancelled || hasFetchedRef.current !== fetchKey) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Final check before API call
        if (!user || !session || !session.access_token) {
          setIsLoading(false);
          hasFetchedRef.current = null;
          return;
        }

        // Explicitly pass auth headers to ensure they're included
        const { data, error: functionError } = await supabase.functions.invoke(
          'get-predictive-recommendations',
          {
            body: {},
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (cancelled || hasFetchedRef.current !== fetchKey) return;

        if (functionError) {
          // Suppress 401 errors completely - they're expected when not authenticated
          const errorObj = functionError as any;
          const status = errorObj?.status || errorObj?.response?.status || errorObj?.context?.status;
          const message = errorObj?.message || '';
          const is401 = status === 401 || message.includes('401') || message.includes('Unauthorized');
          
          if (is401) {
            setRecommendations([]);
            setIsLoading(false);
            hasFetchedRef.current = null;
            return;
          }
          console.error('Error fetching predictive recommendations:', functionError);
          setError(functionError as Error);
          setIsLoading(false);
          return;
        }

        if (cancelled || hasFetchedRef.current !== fetchKey) return;
        setRecommendations(data?.recommendations || []);
        setIsLoading(false);
      } catch (err) {
        if (cancelled || hasFetchedRef.current !== fetchKey) return;
        const error = err as any;
        // Suppress 401 errors completely
        if (error?.status === 401 || error?.message?.includes('401')) {
          setRecommendations([]);
          setIsLoading(false);
          hasFetchedRef.current = null;
          return;
        }
        console.error('Error fetching predictive recommendations:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [user?.id, session?.access_token, authLoading]);

  return { recommendations, isLoading, error };
};

