import { Step } from "@/components/LearningStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Generate a learning plan using Supabase
export const generateLearningPlan = async (topic: string): Promise<Step[]> => {
  // In a real app, this would call an AI service
  // For now, we'll simulate a delay and return a static plan
  return new Promise((resolve) => {
    setTimeout(() => {
      const steps: Step[] = [
        {
          id: 1,
          title: `Understanding the Basics of ${topic}`,
          description: `Explore the fundamental concepts and principles of ${topic}.`
        },
        {
          id: 2,
          title: `Historical Development of ${topic}`,
          description: `Learn about the origin and evolution of ${topic} over time.`
        },
        {
          id: 3,
          title: `Key Components of ${topic}`,
          description: `Break down the essential elements that make up ${topic}.`
        },
        {
          id: 4,
          title: `Practical Applications of ${topic}`,
          description: `Discover how ${topic} is used in real-world scenarios.`
        },
        {
          id: 5,
          title: `Theoretical Frameworks in ${topic}`,
          description: `Examine the theories and models that explain ${topic}.`
        },
        {
          id: 6,
          title: `Current Trends in ${topic}`,
          description: `Stay updated with the latest developments in ${topic}.`
        },
        {
          id: 7,
          title: `Challenges and Limitations in ${topic}`,
          description: `Identify potential obstacles and constraints in ${topic}.`
        },
        {
          id: 8,
          title: `Tools and Technologies for ${topic}`,
          description: `Explore instruments and software used in ${topic}.`
        },
        {
          id: 9,
          title: `Case Studies in ${topic}`,
          description: `Analyze real examples and success stories related to ${topic}.`
        },
        {
          id: 10,
          title: `Future Directions in ${topic}`,
          description: `Predict emerging trends and future possibilities for ${topic}.`
        }
      ];
      resolve(steps);
    }, 2000);
  });
};

// Generate detailed content for a step using the edge function
export const generateStepContent = async (step: Step, topic: string): Promise<string> => {
  try {
    // Check if detailed content already exists
    const { data, error } = await supabase
      .from('learning_steps')
      .select('detailed_content, order_index')
      .eq('id', step.id)
      .single();
    
    if (error) {
      console.error("Error fetching step content:", error);
      throw error;
    }
    
    // If content already exists, return it
    if (data && data.detailed_content) {
      return data.detailed_content;
    }
    
    // Otherwise, generate new content using the edge function
    const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-learning-content', {
      body: {
        stepId: step.id,
        topic: topic,
        title: step.title,
        stepNumber: data?.order_index !== undefined ? data.order_index + 1 : 1,
        totalSteps: 10
      }
    });
    
    if (functionError) {
      console.error("Error invoking edge function:", functionError);
      throw functionError;
    }
    
    if (functionData && functionData.content) {
      return functionData.content;
    }
    
    // Fallback content if edge function fails
    const fallbackContent = `This is detailed information about ${step.title} related to ${topic}. 
      
In a real application, this would be rich, AI-generated content that provides comprehensive information about this specific aspect of ${topic}.

The content would include examples, explanations, and possibly references to help the learner fully understand this step in their learning journey.

It would be tailored to the specific step (${step.id}) in the learning path and would build upon previous knowledge while preparing the learner for subsequent steps.`;
    
    // Update the step with the fallback content
    const { error: updateError } = await supabase
      .from('learning_steps')
      .update({ detailed_content: fallbackContent })
      .eq('id', step.id);
    
    if (updateError) {
      console.error("Error updating step content:", updateError);
      throw updateError;
    }
    
    return fallbackContent;
  } catch (error) {
    console.error("Error in generateStepContent:", error);
    return "Failed to load content. Please try again.";
  }
};
