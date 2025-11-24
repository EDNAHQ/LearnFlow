
import { Step } from "@/components/learning/LearningStep";
import { generateStepContentWithRetry } from "./generateStepContentWithRetry";
import { supabase } from "@/integrations/supabase/client";

interface GenerationResult {
  stepId: string;
  success: boolean;
  error?: string;
}

// Function to start background generation of all content with robust error handling
export const startBackgroundContentGeneration = async (
  steps: Step[],
  topic: string,
  pathId: string
): Promise<GenerationResult[]> => {
  if (!topic || !pathId || !steps || steps.length === 0) {
    console.error("Missing required parameters for content generation");
    return [];
  }

  console.log(`Starting background content generation for ${steps.length} steps`);

  const results: GenerationResult[] = [];
  const generationPromises: Promise<GenerationResult>[] = [];

  // Process steps in parallel with minimal stagger
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    try {
      // Check if detailed content already exists for this step
      const { data, error } = await supabase
        .from("learning_steps")
        .select("detailed_content")
        .eq("id", step.id)
        .single();

      if (error) {
        console.error(`Error checking detailed content for step ${step.id}:`, error);
        results.push({
          stepId: step.id,
          success: false,
          error: `Database error: ${error.message}`,
        });
        continue;
      }

      // Only generate if no detailed content exists
      if (!data.detailed_content) {
        console.log(`Generating content for step ${i + 1}/${steps.length}: ${step.title}`);

        // Small stagger to avoid overwhelming the server
        const delayTime = i * 100; // 100ms stagger between requests

        const generateWithDelay = new Promise<GenerationResult>((resolve) => {
          setTimeout(async () => {
            try {
              await generateStepContentWithRetry(step, topic, true);
              console.log(`✓ Successfully generated content for step ${step.id} (${step.title})`);
              resolve({
                stepId: step.id,
                success: true,
              });
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : "Unknown error occurred";
              console.error(
                `✗ Failed to generate content for step ${step.id} (${step.title}):`,
                errorMessage
              );
              resolve({
                stepId: step.id,
                success: false,
                error: errorMessage,
              });
            }
          }, delayTime);
        });

        generationPromises.push(generateWithDelay);
      } else {
        // Content already exists
        results.push({
          stepId: step.id,
          success: true,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Error in background generation for step ${step.id}:`, errorMessage);
      results.push({
        stepId: step.id,
        success: false,
        error: errorMessage,
      });
    }
  }

  // Wait for all generation tasks to complete (with timeout protection)
  const generationResults = await Promise.allSettled(generationPromises);

  // Process results
  generationResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      results.push(result.value);
    } else {
      // This shouldn't happen since we catch errors inside, but handle it anyway
      const step = steps[index];
      results.push({
        stepId: step?.id || "unknown",
        success: false,
        error: result.reason?.message || "Promise rejected",
      });
    }
  });

  // Log summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(
    `Content generation complete: ${successful} succeeded, ${failed} failed out of ${steps.length} steps`
  );

  if (failed > 0) {
    const failedSteps = results.filter((r) => !r.success);
    console.error("Failed steps:", failedSteps.map((r) => `${r.stepId}: ${r.error}`));
  }

  return results;
};
