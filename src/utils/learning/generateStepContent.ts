import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/learning/LearningStep";
import { EDGE_FUNCTIONS } from "@/integrations/supabase/functions";

// Generate detailed content for a learning step using the edge function
export const generateStepContent = async (step: Step, topic: string, silent = false): Promise<string> => {
  if (!step || !step.id || !topic) {
    console.error("Missing required parameters for content generation:", { step, topic });
    throw new Error("Missing required parameters for content generation");
  }

  try {
    // Get the learning path ID for this step
    const { data: stepData, error: fetchError } = await supabase
      .from('learning_steps')
      .select('path_id, order_index, detailed_content')
      .eq('id', step.id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching step:", fetchError);
      throw new Error("Failed to fetch step data");
    }
    
    // If detailed content already exists, return it
    if (stepData.detailed_content) {
      return stepData.detailed_content;
    }
    
    // Otherwise, call the edge function to generate content
    try {
      console.log(`Generating detailed content for step: ${step.title} (ID: ${step.id})`);
      
      const response = await supabase.functions.invoke(EDGE_FUNCTIONS.generateLearningContent, {
        body: {
          stepId: step.id,
          topic,
          title: step.title,
          stepNumber: stepData.order_index + 1,
          totalSteps: 10,
          silent // Pass the silent parameter to suppress notifications
        }
      });
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error("Failed to generate content using the AI");
      }
      
      const data = response.data;
      
      if (!data || !data.content) {
        console.error("Invalid content format returned:", data);
        throw new Error("Invalid content generated");
      }
      
      // No need to save here as the edge function should have saved it
      console.log(`Content generation for step ${step.id} completed successfully`);
      
      return data.content;
    } catch (error) {
      console.error("Error calling edge function:", error);
      throw new Error("Failed to call the content generation service");
    }
  } catch (error) {
    console.error("Error generating step content:", error);
    throw new Error("Failed to generate content for this step");
  }
};
