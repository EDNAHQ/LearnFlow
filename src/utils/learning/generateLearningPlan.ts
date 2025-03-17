
import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/LearningStep";
import { startBackgroundContentGeneration } from "./backgroundContentGeneration";

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
