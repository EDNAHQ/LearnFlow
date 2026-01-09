import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/learning/LearningStep";
import { EDGE_FUNCTIONS } from "@/integrations/supabase/functions";

// Generate detailed content for a learning step using the edge function
export const generateStepContent = async (
  step: Step,
  topic: string,
  silent = false
): Promise<string> => {
  if (!step || !step.id || !topic) {
    console.error("Missing required parameters for content generation:", { step, topic });
    throw new Error("Missing required parameters for content generation");
  }

  try {
    // Get the learning path ID for this step
    const { data: stepData, error: fetchError } = await supabase
      .from("learning_steps")
      .select("path_id, order_index, detailed_content")
      .eq("id", step.id)
      .single();

    if (fetchError) {
      console.error("Error fetching step:", fetchError);
      throw new Error(`Failed to fetch step data: ${fetchError.message}`);
    }

    // If detailed content already exists, return it
    if (stepData.detailed_content) {
      return stepData.detailed_content;
    }

    // Get user ID for personalization
    const { data: { user } } = await supabase.auth.getUser();

    // Call edge function (timeout handled by generateStepContentWithRetry wrapper)
    const response = await supabase.functions.invoke(EDGE_FUNCTIONS.generateLearningContent, {
      body: {
        stepId: step.id,
        topic,
        title: step.title,
        stepNumber: stepData.order_index + 1,
        totalSteps: 10,
        silent, // Pass the silent parameter to suppress notifications
        userId: user?.id,
        pathId: stepData.path_id,
      },
    });

    if (response.error) {
      console.error("Edge function error:", response.error);
      throw new Error(
        `Edge function error: ${response.error.message || "Unknown error"}`
      );
    }

    const data = response.data;

    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("No data returned from content generation service");
    }

    if (data.error) {
      console.error("Error in response data:", data.error);
      throw new Error(`Content generation failed: ${data.error}`);
    }

    if (!data.content) {
      console.error("Invalid content format returned:", data);
      throw new Error("Invalid content format: missing content field");
    }

    return data.content;
  } catch (error) {
    // Preserve original error message
    if (error instanceof Error) {
      console.error(`Error generating step content for ${step.id}:`, error.message);
      throw error;
    }
    console.error("Error generating step content:", error);
    throw new Error("Failed to generate content for this step");
  }
};
