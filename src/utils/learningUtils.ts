
import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/LearningStep";

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
      return existingSteps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.content || ""
      }));
    }
  } else {
    // Create a new learning path
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
  }
  
  // Now generate the learning plan steps using AI
  try {
    // Call the edge function to generate a learning plan
    const { data, error } = await supabase.functions.invoke('generate-learning-content', {
      body: {
        topic,
        generatePlan: true
      }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error("Failed to generate learning plan using AI");
    }
    
    if (!data.steps || !Array.isArray(data.steps)) {
      throw new Error("Invalid learning plan generated");
    }
    
    const steps: Step[] = [];
    
    // Insert the AI-generated steps into the database
    for (let i = 0; i < data.steps.length; i++) {
      const { data: stepData, error: stepError } = await supabase
        .from('learning_steps')
        .insert({
          title: data.steps[i].title,
          content: data.steps[i].description,
          path_id: pathId,
          order_index: i,
          completed: false
        })
        .select();
        
      if (stepError || !stepData || stepData.length === 0) {
        console.error("Error creating step:", stepError);
        throw new Error("Failed to create learning step");
      }
      
      steps.push({
        id: stepData[0].id,
        title: stepData[0].title,
        description: stepData[0].content || ""
      });
    }
    
    return steps;
  } catch (error) {
    console.error("Error generating learning plan:", error);
    throw new Error("Failed to generate learning plan");
  }
};

// Generate detailed content for a learning step using the edge function
export const generateStepContent = async (step: Step, topic: string): Promise<string> => {
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
      const { data, error } = await supabase.functions.invoke('generate-learning-content', {
        body: {
          stepId: step.id,
          topic,
          title: step.title,
          stepNumber: stepData.order_index + 1,
          totalSteps: 10
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error("Failed to generate content using the AI");
      }
      
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
