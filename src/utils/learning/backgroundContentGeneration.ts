
import { Step } from "@/components/LearningStep";
import { generateStepContent } from "./generateStepContent";
import { supabase } from "@/integrations/supabase/client";

// Function to start background generation of all content
export const startBackgroundContentGeneration = async (steps: Step[], topic: string, pathId: string) => {
  if (!topic || !pathId || !steps || steps.length === 0) {
    console.error("Missing required parameters for content generation");
    return;
  }
  
  console.log(`Starting background content generation for ${steps.length} steps`);
  
  // Generate scripts first before individual step content
  try {
    console.log('Generating podcast and audio scripts for the project');
    
    // Call the edge function to generate scripts
    const scriptResponse = await supabase.functions.invoke('generate-learning-content', {
      body: {
        stepId: steps[0].id,
        topic,
        generateScripts: true,
        silent: true
      }
    });
    
    if (scriptResponse.error) {
      console.error("Error generating scripts:", scriptResponse.error);
    } else {
      console.log('Successfully initiated script generation');
    }
  } catch (error) {
    console.error('Error triggering script generation:', error);
  }
  
  // Process each step sequentially to avoid overwhelming the Edge Functions
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
        
        try {
          // Wait a bit between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate content for this step
          await generateStepContent(step, topic, true);
          console.log(`Successfully generated content for step ${step.id}`);
        } catch (genError) {
          console.error(`Error generating content for step ${step.id}:`, genError);
        }
      } else {
        console.log(`Content already exists for step ${i+1}: ${step.title}`);
      }
    } catch (error) {
      console.error(`Error in content generation for step ${step.id}:`, error);
    }
  }
  
  console.log(`Completed content generation process for all ${steps.length} steps`);
  return true;
};
