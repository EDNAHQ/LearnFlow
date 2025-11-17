import { useCallback } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';

export type ProjectType = 
  | 'dashboard' 
  | 'automation' 
  | 'code' 
  | 'agent' 
  | 'dataset' 
  | 'app_prototype' 
  | 'document';

interface WorkOutputParams {
  projectType: ProjectType;
  title: string;
  description?: string;
  fileReference?: string;
  fileUrl?: string;
  skillTagsUsed?: string[];
  difficultyRating?: number;
  timeToComplete?: number; // minutes
  pathId?: string;
  stepId?: string;
  metadata?: Record<string, any>;
}

/**
 * Hook for tracking work outputs (Phase 3)
 * This is the secret weapon - scoring real work outputs against skill rubrics
 */
export const useWorkOutputTracking = () => {
  const { user } = useAuth();

  const logWorkOutput = useCallback(async (params: WorkOutputParams) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('work_outputs')
        .insert({
          user_id: user.id,
          project_type: params.projectType,
          title: params.title,
          description: params.description,
          file_reference: params.fileReference,
          file_url: params.fileUrl,
          skill_tags_used: params.skillTagsUsed || [],
          difficulty_rating: params.difficultyRating,
          time_to_complete: params.timeToComplete,
          path_id: params.pathId || null,
          step_id: params.stepId || null,
          assessment_status: 'pending',
          metadata: params.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('[useWorkOutputTracking] Error logging work output:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[useWorkOutputTracking] Unexpected error:', error);
      throw error;
    }
  }, [user]);

  const updateWorkOutputAssessment = useCallback(async (
    outputId: string,
    updates: {
      autoScore?: number;
      manualScore?: number;
      feedbackSummary?: string;
      assessmentStatus?: 'pending' | 'auto_assessed' | 'manually_reviewed' | 'needs_review';
    }
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('work_outputs')
        .update(updates)
        .eq('id', outputId)
        .eq('user_id', user.id); // Ensure user can only update their own outputs

      if (error) {
        console.error('[useWorkOutputTracking] Error updating assessment:', error);
        throw error;
      }
    } catch (error) {
      console.error('[useWorkOutputTracking] Unexpected error:', error);
      throw error;
    }
  }, [user]);

  return {
    logWorkOutput,
    updateWorkOutputAssessment
  };
};

