
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
  
  // Process steps concurrently but with a small delay between requests to avoid rate limiting
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
        
        // Add a small delay between requests to avoid rate limiting
        const delayTime = i * 1500; // 1.5 seconds between requests
        
        const generateWithDelay = new Promise<void>((resolve) => {
          setTimeout(() => {
            // Call the function but don't await - let it run in background
            generateStepContent(step, topic, true)
              .then(content => {
                console.log(`Successfully generated content for step ${step.id}`);
                resolve();
              })
              .catch(err => {
                console.error(`Background generation error for step ${step.id}:`, err);
                resolve(); // Still resolve to continue with other steps
              });
          }, delayTime);
        });
        
        generationPromises.push(generateWithDelay);
      }
    } catch (error) {
      console.error(`Error in background generation for step ${step.id}:`, error);
      // Continue with other steps even if one fails
    }
  }
  
  // Return a promise that resolves when all generation is complete
  return Promise.all(generationPromises);
};
