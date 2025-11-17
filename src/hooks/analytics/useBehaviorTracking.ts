import { useCallback } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { getDiscoveryForAction } from '@/utils/personalization/discoveryMessages';

// Try to get discovery context, but don't fail if not available
let discoveryContext: { showDiscovery: (type: any, message: string, detail?: string) => void } | null = null;

export const setDiscoveryContext = (context: typeof discoveryContext) => {
  discoveryContext = context;
};

export type ActionType = 
  | 'click' 
  | 'search' 
  | 'module_open' 
  | 'hint_request' 
  | 'task_failure' 
  | 'task_success' 
  | 'content_view' 
  | 'content_complete'
  | 'example_viewed'
  | 'task_attempt';

export type ContentType = 'module' | 'step' | 'path' | 'project' | 'content';

interface BehaviorLogParams {
  actionType: ActionType;
  contentId?: string;
  contentType?: ContentType;
  pathId?: string;
  stepId?: string;
  timeOnContent?: number; // seconds
  taskFailureCount?: number;
  taskSuccessCount?: number;
  attempts?: number;
  metadata?: Record<string, any>;
}

/**
 * Hook for tracking user behavior automatically
 * This captures Phase 2 data: clicks, content consumption, task failures, etc.
 */
export const useBehaviorTracking = () => {
  const { user } = useAuth();

  const logBehavior = useCallback(async (params: BehaviorLogParams) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('behavior_logs')
        .insert({
          user_id: user.id,
          action_type: params.actionType,
          content_id: params.contentId,
          content_type: params.contentType,
          path_id: params.pathId || null,
          step_id: params.stepId || null,
          time_on_content: params.timeOnContent,
          task_failure_count: params.taskFailureCount || 0,
          task_success_count: params.taskSuccessCount || 0,
          attempts: params.attempts || 1,
          metadata: params.metadata || {}
        });

      if (error) {
        console.error('[useBehaviorTracking] Error logging behavior:', error);
      } else {
        // Try to show discovery notification
        try {
          const discovery = getDiscoveryForAction(params.actionType, params.metadata);
          if (discovery && discoveryContext) {
            discoveryContext.showDiscovery(discovery.type, discovery.message, discovery.detail);
          }
        } catch (err) {
          // Silently fail - discovery is optional
        }
      }
    } catch (error) {
      console.error('[useBehaviorTracking] Unexpected error:', error);
    }
  }, [user]);

  // Convenience methods for common actions
  const trackClick = useCallback((contentId: string, contentType?: ContentType) => {
    logBehavior({ actionType: 'click', contentId, contentType });
  }, [logBehavior]);

  const trackContentView = useCallback((
    contentId: string, 
    contentType: ContentType,
    pathId?: string,
    stepId?: string
  ) => {
    logBehavior({ 
      actionType: 'content_view', 
      contentId, 
      contentType,
      pathId,
      stepId
    });
  }, [logBehavior]);

  const trackContentComplete = useCallback((
    contentId: string,
    contentType: ContentType,
    timeOnContent: number,
    pathId?: string,
    stepId?: string
  ) => {
    logBehavior({
      actionType: 'content_complete',
      contentId,
      contentType,
      timeOnContent,
      pathId,
      stepId
    });
  }, [logBehavior]);

  const trackTaskFailure = useCallback((
    contentId: string,
    attempts: number,
    pathId?: string,
    stepId?: string
  ) => {
    logBehavior({
      actionType: 'task_failure',
      contentId,
      contentType: 'step',
      attempts,
      taskFailureCount: 1,
      pathId,
      stepId
    });
  }, [logBehavior]);

  const trackTaskSuccess = useCallback((
    contentId: string,
    attempts: number,
    pathId?: string,
    stepId?: string
  ) => {
    logBehavior({
      actionType: 'task_success',
      contentId,
      contentType: 'step',
      attempts,
      taskSuccessCount: 1,
      pathId,
      stepId
    });
  }, [logBehavior]);

  const trackHintRequest = useCallback((
    contentId: string,
    pathId?: string,
    stepId?: string
  ) => {
    logBehavior({
      actionType: 'hint_request',
      contentId,
      contentType: 'step',
      pathId,
      stepId,
      metadata: { hintRequested: true }
    });
  }, [logBehavior]);

  const trackExampleViewed = useCallback((
    contentId: string,
    pathId?: string,
    stepId?: string
  ) => {
    logBehavior({
      actionType: 'example_viewed',
      contentId,
      contentType: 'step',
      pathId,
      stepId,
      metadata: { exampleViewed: true }
    });
  }, [logBehavior]);

  const trackSearch = useCallback((query: string) => {
    logBehavior({
      actionType: 'search',
      metadata: { query }
    });
  }, [logBehavior]);

  return {
    logBehavior,
    trackClick,
    trackContentView,
    trackContentComplete,
    trackTaskFailure,
    trackTaskSuccess,
    trackHintRequest,
    trackExampleViewed,
    trackSearch
  };
};

