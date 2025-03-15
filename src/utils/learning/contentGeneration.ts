
import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/LearningStep";
import { toast } from "sonner";
import { LearningStepData } from "@/hooks/useLearningSteps";

// Generate detailed content for a learning step using the edge function
export const generateStepContent = async (
  step: Step | LearningStepData, 
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
    
    console.log(`Generating detailed content for step: ${step.title} (ID: ${step.id})`);
    
    // Start the edge function to generate content
    const response = await supabase.functions.invoke('generate-learning-content', {
      body: {
        stepId: step.id,
        topic,
        title: step.title,
        stepNumber: stepData.order_index + 1,
        totalSteps: 10
      }
    });
    
    if (response.error) {
      console.error("Edge function error:", response.error);
      throw new Error("Failed to generate content");
    }
    
    const data = response.data;
    
    if (!data || !data.content) {
      console.error("Invalid content format returned:", data);
      throw new Error("Invalid content format");
    }
    
    // Ensure content is saved to the database
    const { error: updateError } = await supabase
      .from('learning_steps')
      .update({ detailed_content: data.content })
      .eq('id', step.id);
      
    if (updateError) {
      console.error("Error saving content to database:", updateError);
      throw new Error("Failed to save content");
    }
    
    return data.content;
  } catch (error) {
    console.error("Error generating step content:", error);
    throw new Error("Failed to generate content for this step");
  }
};

// Function to start background generation of content for first step
export const startBackgroundContentGeneration = async (steps: Step[], topic: string, pathId: string) => {
  if (steps.length === 0 || !topic || !pathId) {
    console.error("Missing parameters for background content generation");
    return;
  }
  
  // Generate content only for the first step to get started quickly
  if (steps.length > 0) {
    const firstStep = steps[0];
    try {
      const { data, error } = await supabase
        .from('learning_steps')
        .select('detailed_content')
        .eq('id', firstStep.id)
        .single();
        
      if (error) {
        console.error(`Error checking first step content:`, error);
      } else if (!data.detailed_content) {
        console.log(`Generating content for first step: ${firstStep.title}`);
        try {
          await generateStepContent(firstStep, topic, false);
          console.log(`Successfully generated content for first step`);
        } catch (err) {
          console.error(`Error generating first step content:`, err);
        }
      }
    } catch (error) {
      console.error(`Error generating first step:`, error);
    }
  }
};
