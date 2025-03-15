
import { supabase } from "@/integrations/supabase/client";

// Generate a title for a learning path
export const generateLearningTitle = async (topic: string, pathId: string): Promise<string> => {
  try {
    console.log(`Generating title for topic: ${topic}`);
    
    const response = await supabase.functions.invoke('generate-learning-title', {
      body: {
        topic,
        pathId
      }
    });
    
    if (response.error) {
      console.error("Edge function error:", response.error);
      throw new Error("Failed to generate title");
    }
    
    const data = response.data;
    
    if (!data || !data.title) {
      console.error("Invalid title format returned:", data);
      throw new Error("Invalid title generated");
    }
    
    return data.title;
  } catch (error) {
    console.error("Error generating title:", error);
    throw new Error("Failed to generate title");
  }
};
