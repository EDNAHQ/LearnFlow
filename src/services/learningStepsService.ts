import { supabase } from "@/integrations/supabase/client";
import { LearningStepData } from "@/hooks/learning-steps/types";

/**
 * Fetch all learning steps for a given path.
 */
export const fetchSteps = async (pathId: string): Promise<LearningStepData[]> => {
  const { data, error } = await supabase
    .from('learning_steps')
    .select('*')
    .eq('path_id', pathId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching learning steps:', error);
    throw error;
  }

  if (!data) return [];

  return data.map(step => ({
    ...step,
    content: typeof step.content === 'string'
      ? step.content
      : (step.content ? JSON.stringify(step.content) : 'No content available'),
    detailed_content: typeof step.detailed_content === 'string'
      ? step.detailed_content
      : (step.detailed_content ? JSON.stringify(step.detailed_content) : null)
  }));
};

/**
 * Mark a learning step as completed.
 */
export const markStepComplete = async (stepId: string): Promise<void> => {
  const { error } = await supabase
    .from('learning_steps')
    .update({ completed: true })
    .eq('id', stepId);

  if (error) {
    console.error('Error marking step as complete:', error);
    throw error;
  }
};

/**
 * Subscribe to realtime updates for learning steps belonging to a path.
 * Returns an unsubscribe function.
 */
export const subscribeToStepUpdates = (
  pathId: string,
  onUpdate: (payload: any) => void
): (() => void) => {
  const channel = supabase.channel(`steps-${pathId}`);

  channel
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'learning_steps',
        filter: `path_id=eq.${pathId}`
      },
      onUpdate
    )
    .subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        console.log(`Subscription status: ${status}`);
      }
    });

  return () => {
    channel.unsubscribe();
  };
};
