import { useCallback } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';

interface ProgressTrackingParams {
  moduleId: string;
  stepId?: string;
  completionTime?: number; // seconds
  difficultyRating?: number; // 1-5
  successRate?: number; // 0-100
  remediationNeeded?: boolean;
  attemptsCount?: number;
  hintsRequested?: number;
  examplesViewed?: number;
  skipped?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Hook for tracking learning progress and difficulty adaptation
 * Tracks completion times, difficulty ratings, success rates, and remediation needs
 */
export const useProgressTracking = () => {
  const { user } = useAuth();

  const logProgress = useCallback(async (params: ProgressTrackingParams) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('progress_tracking')
        .insert({
          user_id: user.id,
          module_id: params.moduleId,
          step_id: params.stepId || null,
          completion_time: params.completionTime,
          difficulty_rating: params.difficultyRating,
          success_rate: params.successRate,
          remediation_needed: params.remediationNeeded || false,
          attempts_count: params.attemptsCount || 1,
          hints_requested: params.hintsRequested || 0,
          examples_viewed: params.examplesViewed || 0,
          skipped: params.skipped || false,
          metadata: params.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('[useProgressTracking] Error logging progress:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[useProgressTracking] Unexpected error:', error);
      throw error;
    }
  }, [user]);

  const markComplete = useCallback(async (
    moduleId: string,
    completionTime: number,
    stepId?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('progress_tracking')
        .update({
          completed_at: new Date().toISOString(),
          completion_time: completionTime
        })
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('step_id', stepId || null);

      if (error) {
        console.error('[useProgressTracking] Error marking complete:', error);
        throw error;
      }
    } catch (error) {
      console.error('[useProgressTracking] Unexpected error:', error);
      throw error;
    }
  }, [user]);

  return {
    logProgress,
    markComplete
  };
};

