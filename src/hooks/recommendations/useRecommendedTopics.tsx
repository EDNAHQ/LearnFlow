import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export interface RecommendedTopic {
  topic: string;
  reason: string;
  category: 'getting_started' | 'continue_learning' | 'next_steps' | 'complementary';
}

export const useRecommendedTopics = () => {
  const [recommendations, setRecommendations] = useState<RecommendedTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('[useRecommendedTopics] Fetching recommendations for user:', user.id);

        const { data, error: functionError } = await supabase.functions.invoke(
          'get-recommended-topics',
          {
            body: {},
          }
        );

        console.log('[useRecommendedTopics] Full response data:', JSON.stringify(data, null, 2));
        console.log('[useRecommendedTopics] Response error:', functionError);

        if (functionError) {
          console.error('[useRecommendedTopics] Function error:', functionError);
          throw functionError;
        }

        const recs = data?.recommendations || [];
        console.log('[useRecommendedTopics] Recommendations array:', JSON.stringify(recs, null, 2));
        console.log('[useRecommendedTopics] Recommendations length:', recs.length);

        if (recs.length === 0) {
          console.warn('[useRecommendedTopics] No recommendations returned from API');
        }

        setRecommendations(recs);
      } catch (err) {
        console.error('[useRecommendedTopics] Error fetching recommendations:', err);
        setError(err as Error);
        // Set default recommendations on error
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  return { recommendations, isLoading, error };
};
