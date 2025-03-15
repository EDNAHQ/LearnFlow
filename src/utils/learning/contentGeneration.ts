import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/LearningStep";
import { toast } from "sonner";

// Function to start background generation of all content
export const startBackgroundContentGeneration = async (steps: Step[], topic: string, pathId: string) => {
  console.log(`Starting background content generation for ${steps.length} steps`);
  
  // First, prioritize generating the first step
  if (steps.length > 0) {
    const firstStep = steps[0];
    try {
      // Check if detailed content already exists for the first step
      const { data, error } = await supabase
        .from('learning_steps')
        .select('detailed_content')
        .eq('id', firstStep.id)
        .single();
        
      if (error) {
        console.error(`Error checking detailed content for first step ${firstStep.id}:`, error);
      } else if (!data.detailed_content) {
        console.log(`Prioritizing generation of first step: ${firstStep.title}`);
        
        // Generate the first step content immediately (not silent)
        try {
          await generateStepContent(firstStep, topic, false);
          console.log(`Successfully generated content for first step ${firstStep.id}`);
        } catch (err) {
          console.error(`Error generating first step content ${firstStep.id}:`, err);
        }
      }
    } catch (error) {
      console.error(`Error prioritizing first step ${firstStep.id}:`, error);
    }
  }
  
  // Then process the rest of the steps in the background
  for (let i = 1; i < steps.length; i++) {
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
        
        // Call the function but don't await - let it run in background
        generateStepContent(step, topic, true)
          .then(content => {
            console.log(`Successfully generated content for step ${step.id}`);
          })
          .catch(err => {
            console.error(`Background generation error for step ${step.id}:`, err);
          });
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`Error in background generation for step ${step.id}:`, error);
      // Continue with other steps even if one fails
    }
  }
};

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
      
      // Show a toast for the first step generation
      if (!silent) {
        toast.loading(`Generating content for "${step.title}"...`, {
          id: `generating-step-${step.id}`,
          duration: 3000
        });
      }
      
      const response = await supabase.functions.invoke('generate-learning-content', {
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
      
      // Clear the loading toast if not silent
      if (!silent) {
        toast.success(`Content for "${step.title}" is ready!`, {
          id: `generating-step-${step.id}`,
          duration: 2000
        });
      }
      
      // No need to save here as the edge function should have saved it
      console.log(`Content generation for step ${step.id} completed successfully`);
      
      return data.content;
    } catch (error) {
      console.error("Error calling edge function:", error);
      
      // Show error toast if not silent
      if (!silent) {
        toast.error(`Failed to generate content for "${step.title}". Please try again.`, {
          id: `generating-step-${step.id}`,
          duration: 4000
        });
      }
      
      throw new Error("Failed to call the content generation service");
    }
  } catch (error) {
    console.error("Error generating step content:", error);
    throw new Error("Failed to generate content for this step");
  }
};
