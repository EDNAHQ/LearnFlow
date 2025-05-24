
import { useCallback } from "react";
import { fetchSteps } from "@/services/learningStepsService";
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

      const processedData = await fetchSteps(pathId);

      if (processedData.length > 0) {
        console.log(`Retrieved ${processedData.length} learning steps for path:`, pathId);

        // Always update steps to ensure freshness
        setSteps(processedData);
        
        // Count steps with detailed content
        const stepsWithDetailedContent = countGeneratedSteps(processedData);
        
        // Only update state if count has changed
        if (stepsWithDetailedContent !== generatedSteps) {
          setGeneratedSteps(stepsWithDetailedContent);
          setGeneratingContent(stepsWithDetailedContent < processedData.length);
          console.log(`Content generation status: ${stepsWithDetailedContent}/${processedData.length} steps generated`);
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
