
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LearningStepData } from "./types";

export const useFetchLearningSteps = () => {
  const fetchLearningSteps = useCallback(async (
    pathId: string | null,
    countGeneratedSteps: (stepsArray: LearningStepData[]) => number,
    setSteps: React.Dispatch<React.SetStateAction<LearningStepData[]>>,
    setGeneratedSteps: React.Dispatch<React.SetStateAction<number>>,
    setGeneratingContent: React.Dispatch<React.SetStateAction<boolean>>,
    generatedSteps: number
  ) => {
    if (!pathId) return;
    
    try {
      console.log("Fetching learning steps for path:", pathId);
      
      const { data, error } = await supabase
        .from('learning_steps')
        .select('*')
        .eq('path_id', pathId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error("Error fetching learning steps:", error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`Retrieved ${data.length} learning steps for path:`, pathId);
        
        // Process data to ensure all values are properly formatted as strings
        const processedData = data.map(step => ({
          ...step,
          content: typeof step.content === 'string' 
            ? step.content 
            : (step.content ? JSON.stringify(step.content) : "No content available"),
          detailed_content: typeof step.detailed_content === 'string'
            ? step.detailed_content
            : (step.detailed_content ? JSON.stringify(step.detailed_content) : null)
        }));
        
        // Count steps with detailed content first
        const stepsWithDetailedContent = countGeneratedSteps(processedData);

        // Only update state if count has changed to prevent unnecessary re-renders
        if (stepsWithDetailedContent !== generatedSteps) {
          setSteps(processedData);
          setGeneratedSteps(stepsWithDetailedContent);
          setGeneratingContent(stepsWithDetailedContent < processedData.length);
          console.log(`Content generation status: ${stepsWithDetailedContent}/${processedData.length} steps generated`);
        } else {
          // Still update steps but don't log or trigger other updates
          setSteps(processedData);
        }
      } else {
        console.log("No learning steps found for path:", pathId);
      }
    } catch (error) {
      console.error("Error fetching learning steps:", error);
    }
  }, []);

  return { fetchLearningSteps };
};
