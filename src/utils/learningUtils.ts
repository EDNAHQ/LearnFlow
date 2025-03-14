
import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/LearningStep";
import { toast } from "sonner";

interface LearningPathData {
  id: string;
  topic: string;
  is_approved: boolean;
}

// Generate a learning plan for a given topic
export const generateLearningPlan = async (topic: string): Promise<Step[]> => {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast.error("You need to log in to create and save learning plans.");
    throw new Error("User is not authenticated");
  }
  
  // Check if a learning path already exists for this topic for the current user
  const { data: existingPaths, error: pathError } = await supabase
    .from('learning_paths')
    .select('id, topic, is_approved')
    .eq('topic', topic)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (pathError) {
    console.error("Error checking existing paths:", pathError);
    throw new Error("Failed to check existing learning paths");
  }
  
  let pathId: string;
  
  // If a path already exists, use it, otherwise create a new one
  if (existingPaths && existingPaths.length > 0) {
    pathId = existingPaths[0].id;
    console.log("Found existing learning path:", pathId);
    
    // Check if the path already has steps
    const { data: existingSteps, error: stepsError } = await supabase
      .from('learning_steps')
      .select('id, title, content, order_index')
      .eq('path_id', pathId)
      .order('order_index');
      
    if (stepsError) {
      console.error("Error checking existing steps:", stepsError);
      throw new Error("Failed to check existing learning steps");
    }
    
    // If steps exist, return them
    if (existingSteps && existingSteps.length > 0) {
      console.log(`Found ${existingSteps.length} existing steps for path ${pathId}`);
      
      // Start background generation for steps without detailed content
      startBackgroundContentGeneration(existingSteps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.content || ""
      })), topic, pathId);
      
      return existingSteps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.content || ""
      }));
    }
  } else {
    // Create a new learning path
    console.log("Creating new learning path for topic:", topic);
    const { data: newPath, error: createError } = await supabase
      .from('learning_paths')
      .insert({
        topic,
        user_id: user.id,
        is_approved: false
      })
      .select();
      
    if (createError || !newPath || newPath.length === 0) {
      console.error("Error creating new learning path:", createError);
      throw new Error("Failed to create learning path");
    }
    
    pathId = newPath[0].id;
    console.log("New learning path created:", pathId);
  }
  
  // Now generate the learning plan steps using AI
  try {
    console.log("Calling edge function to generate learning plan");
    
    // Call the edge function to generate a learning plan
    const response = await supabase.functions.invoke('generate-learning-content', {
      body: {
        topic,
        generatePlan: true
      }
    });
    
    if (response.error) {
      console.error("Edge function error:", response.error);
      throw new Error("Failed to generate learning plan using AI");
    }
    
    const data = response.data;
    
    if (!data || !data.steps || !Array.isArray(data.steps)) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid learning plan generated");
    }
    
    console.log(`Generated ${data.steps.length} steps for learning plan`);
    
    const steps: Step[] = [];
    
    // Insert the AI-generated steps into the database
    // Fix: Ensure we're using the user's auth token, not the anonymous token
    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      
      if (!step.title || !step.description) {
        console.warn(`Step ${i} is missing title or description, skipping`);
        continue;
      }
      
      const { data: stepData, error: stepError } = await supabase
        .from('learning_steps')
        .insert({
          title: step.title,
          content: step.description,
          path_id: pathId,
          order_index: i,
          completed: false
        })
        .select();
        
      if (stepError || !stepData || stepData.length === 0) {
        console.error(`Error creating step ${i}:`, stepError);
        // Continue with other steps even if one fails
        continue;
      }
      
      steps.push({
        id: stepData[0].id,
        title: stepData[0].title,
        description: stepData[0].content || ""
      });
    }
    
    if (steps.length === 0) {
      throw new Error("No learning steps were created");
    }
    
    console.log(`Successfully created ${steps.length} learning steps`);
    
    // No need to start background generation here - it will start after plan approval
    
    return steps;
  } catch (error) {
    console.error("Error generating learning plan:", error);
    throw new Error("Failed to generate learning plan");
  }
};

// Function to start background generation of all content
const startBackgroundContentGeneration = async (steps: Step[], topic: string, pathId: string) => {
  console.log(`Starting background content generation for ${steps.length} steps`);
  
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
