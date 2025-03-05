import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/LearningStep";

interface LearningPathData {
  id: string;
  topic: string;
  is_approved: boolean;
}

interface LearningStepData {
  id: string;
  title: string;
  content: string;
  order_index: number;
  path_id: string;
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
  
  // Now generate the learning plan steps using edge function
  try {
    const steps: Step[] = [];
    
    // Mock steps generator function - in production this would call an AI API
    const titles = [
      "Introduction to the Fundamentals",
      "Core Concepts & Terminology",
      "Historical Development & Context",
      "Key Theories & Frameworks",
      "Practical Applications",
      "Common Challenges & Solutions",
      "Advanced Techniques",
      "Resources & Tools",
      "Case Studies & Examples",
      "Synthesis & Next Steps"
    ];
    
    for (let i = 0; i < 10; i++) {
      const { data: stepData, error: stepError } = await supabase
        .from('learning_steps')
        .insert({
          title: titles[i],
          content: `Understanding ${titles[i].toLowerCase()} related to ${topic}.`,
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

// Generate detailed content for a learning step
export const generateStepContent = async (step: Step, topic: string): Promise<string> => {
  try {
    // Check if content already exists in the database
    const { data: stepData, error: fetchError } = await supabase
      .from('learning_steps')
      .select('detailed_content')
      .eq('id', step.id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching step content:", fetchError);
      throw new Error("Failed to fetch step content");
    }
    
    // If detailed content already exists, return it
    if (stepData && stepData.detailed_content) {
      return stepData.detailed_content;
    }
    
    // Otherwise, generate new content using an edge function or API
    // For now, we'll generate mock content
    const content = `# ${step.title} for ${topic}

## Overview
This section covers the essential aspects of ${step.title.toLowerCase()} as they relate to ${topic}.

## Key Points
- Understanding fundamental concepts of ${topic} in this area
- Learning practical applications
- Exploring related theories and frameworks
- Connecting the dots with previous topics

## Detailed Explanation
${topic} has many interesting aspects when it comes to ${step.title.toLowerCase()}. Experts in the field suggest approaching this topic by first understanding the basic principles, then gradually expanding your knowledge to more complex ideas.

## Practice Questions
1. What are the core elements of ${step.title.toLowerCase()} in ${topic}?
2. How can you apply these concepts in real-world situations?
3. What challenges might you encounter and how would you overcome them?

## Resources
- Books: "The Complete Guide to ${topic}"
- Online Courses: "${topic} Masterclass"
- Communities: Join the ${topic} discussion forum for more insights

## Next Steps
After mastering this section, you'll be ready to move on to the next step in your learning journey.`;

    // Save the generated content to the database
    const { error: updateError } = await supabase
      .from('learning_steps')
      .update({ detailed_content: content })
      .eq('id', step.id);
      
    if (updateError) {
      console.error("Error updating step content:", updateError);
      throw new Error("Failed to save generated content");
    }
    
    return content;
  } catch (error) {
    console.error("Error generating step content:", error);
    throw new Error("Failed to generate content for this step");
  }
};
