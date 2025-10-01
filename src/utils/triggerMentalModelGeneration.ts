import { supabase } from '@/integrations/supabase/client';

/**
 * Generate mental model prompts and save them (without generating images)
 * Call this once after all steps have been created
 */
export async function triggerMentalModelGeneration(pathId: string, topic: string) {
  try {
    console.log(`Generating mental model prompts for path: ${pathId}`);

    // Get all step titles from the path to create comprehensive prompts
    const { data: steps, error: stepsError } = await supabase
      .from('learning_steps')
      .select('title, content')
      .eq('path_id', pathId)
      .order('order_index');

    if (stepsError) throw stepsError;

    // Create prompts based on the entire learning journey
    const stepTitles = steps?.map(s => s.title) || [];
    const pathSummary = `A comprehensive ${steps?.length || 10}-step learning journey about "${topic}"`;

    // Call the edge function to generate prompts only
    const { data, error } = await supabase.functions.invoke('generate-path-mental-models', {
      body: {
        pathId,
        topic,
        stepTitles,
        pathSummary,
        generateImagesNow: false // Just create prompts, don't generate images
      }
    });

    if (error) throw error;

    console.log('Mental model prompts created:', data);

    // Return the prompts array from the response
    return data?.prompts || [];

  } catch (error) {
    console.error('Failed to generate mental model prompts:', error);
    throw error;
  }
}
