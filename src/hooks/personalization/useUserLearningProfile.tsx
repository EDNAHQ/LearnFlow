import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export interface UserLearningProfile {
  avgCompletionTime: number;
  learningVelocity: 'fast' | 'normal' | 'deliberate';
  optimalSessionLength: number;
  preferredDifficulty: number;
  difficultyGap: number;
  avgSuccessRate: number;
  prefersAudio: boolean;
  prefersVisual: boolean;
  prefersText: boolean;
  preferredLearningTimes: string[];
  devicePreference: 'mobile' | 'desktop' | 'tablet' | null;
  hintUsageRate: number;
  skipRate: number;
  exampleUsageRate: number;
  remediationFrequency: number;
  failureRecoveryRate: number;
  conceptsNeedingRemediation: string[];
  totalLearningTimeMinutes: number;
  dailyAverageMinutes: number;
  longestStreakDays: number;
  currentStreakDays: number;
  mostEngagedTopics: string[];
  leastEngagedTopics: string[];
}

export const useUserLearningProfile = (options?: { enabled?: boolean }) => {
  const [profile, setProfile] = useState<UserLearningProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session, loading: authLoading } = useAuth();
  const hasAuthenticatedRef = useRef(false);
  const enabled = options?.enabled !== false; // Default to true for backward compatibility
  
  // Use stable references to prevent unnecessary re-fetches
  const userId = user?.id;
  const accessToken = session?.access_token;
  const expiresAt = session?.expires_at;

  useEffect(() => {
    // Reset flag when auth state changes
    hasAuthenticatedRef.current = false;

    // If explicitly disabled, don't make any requests
    if (!enabled) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Don't make requests while auth is loading
    if (authLoading) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If auth is loaded but no user/session, don't make any requests
    // Early return prevents any API calls
    if (!userId || !accessToken) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Verify session is still valid by checking expiration
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt < now) {
      // Session expired, don't make request
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Mark as authenticated and proceed
    hasAuthenticatedRef.current = true;
    let cancelled = false;

    const fetchProfile = async () => {
      // Re-check authentication before making the request
      if (cancelled || !hasAuthenticatedRef.current || !userId || !accessToken) {
        return;
      }

      // Re-check session expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt < currentTime) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Final check before API call
        if (!userId || !accessToken) {
          setIsLoading(false);
          return;
        }

        // Explicitly pass auth headers to ensure they're included
        const { data, error: functionError } = await supabase.functions.invoke(
          'get-user-learning-profile',
          {
            body: {},
            headers: {
              Authorization: `Bearer ${accessToken}`,
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
            // Silently handle 401 - don't log or set error state
            setProfile(null);
            setIsLoading(false);
            return;
          }
          console.error('Error fetching user learning profile:', functionError);
          setError(functionError as Error);
          setIsLoading(false);
          return;
        }

        if (cancelled || !hasAuthenticatedRef.current) return;
        setProfile(data?.profile || null);
        setIsLoading(false);
      } catch (err) {
        if (cancelled || !hasAuthenticatedRef.current) return;
        const error = err as any;
        // Suppress 401 errors completely - don't log them
        const is401 = error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized');
        if (is401) {
          setProfile(null);
          setIsLoading(false);
          return;
        }
        console.error('Error fetching user learning profile:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    // Execute immediately if all checks pass
    fetchProfile();

    return () => {
      cancelled = true;
      hasAuthenticatedRef.current = false;
    };
  }, [userId, accessToken, expiresAt, authLoading, enabled]);

  return { profile, isLoading, error };
};

