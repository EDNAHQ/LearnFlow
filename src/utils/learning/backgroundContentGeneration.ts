
import { Step } from "@/components/learning/LearningStep";
import { generateStepContent } from "./generateStepContent";
import { supabase } from "@/integrations/supabase/client";

// Function to start background generation of all content
export const startBackgroundContentGeneration = async (steps: Step[], topic: string, pathId: string) => {
  if (!topic || !pathId || !steps || steps.length === 0) {
    console.error("Missing required parameters for content generation");
    return;
  }
  
  console.log(`Starting background content generation for ${steps.length} steps`);
  
  // We'll use Promises to track all generation tasks
  const generationPromises = [];
  
  // Process steps in parallel with minimal stagger
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    try {
      // Check if detailed content already exists for this step
      const { data, error } = await supabase
        .from('learning_steps')
        .select('detailed_content')
        .eq('id', step.id)
        .single();

      if (error) {
        console.error(`Error checking detailed content for step ${step.id}:`, error);
        continue;
      }

      // Only generate if no detailed content exists
      if (!data.detailed_content) {
        console.log(`Generating content for step ${i+1}/${steps.length}: ${step.title}`);

        // Small stagger to avoid overwhelming the server
        const delayTime = i * 100; // 100ms stagger between requests

        const generateWithDelay = new Promise<void>((resolve) => {
          setTimeout(() => {
            generateStepContent(step, topic, true)
              .then(content => {
                console.log(`Successfully generated content for step ${step.id}`);
                resolve();
              })
              .catch(err => {
                console.error(`Background generation error for step ${step.id}:`, err);
                resolve();
              });
          }, delayTime);
        });

        generationPromises.push(generateWithDelay);
      }
    } catch (error) {
      console.error(`Error in background generation for step ${step.id}:`, error);
    }
  }
  
  // Return a promise that resolves when all generation is complete
  return Promise.all(generationPromises);
};
