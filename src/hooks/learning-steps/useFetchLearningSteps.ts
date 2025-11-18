
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
        const processedData = data.map(step => ({
          ...step,
          content: typeof step.content === 'string' 
            ? step.content 
            : (step.content ? JSON.stringify(step.content) : "No content available"),
          detailed_content: typeof step.detailed_content === 'string'
            ? step.detailed_content
            : (step.detailed_content ? JSON.stringify(step.detailed_content) : null)
        }));
        
        setSteps(processedData);

        const stepsWithDetailedContent = countGeneratedSteps(processedData);
        const hasSteps = processedData.length > 0;
        const isGenerating = hasSteps && stepsWithDetailedContent < processedData.length;

        if (stepsWithDetailedContent !== generatedSteps && stepsWithDetailedContent > 0) {
          console.log(`✓ Content: ${stepsWithDetailedContent}/${processedData.length} steps generated`);
        }

        setGeneratedSteps(prev => {
          if (prev === stepsWithDetailedContent) {
            return prev;
          }
          return stepsWithDetailedContent;
        });

        setGeneratingContent(prev => {
          if (prev === isGenerating) {
            return prev;
          }
          return isGenerating;
        });
      } else {
        setSteps([]);
        setGeneratedSteps(0);
        setGeneratingContent(false);
      }
    } catch (error) {
      console.error("Error fetching learning steps:", error);
    }
  }, []);

  return { fetchLearningSteps };
};
