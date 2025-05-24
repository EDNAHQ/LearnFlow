
import { useCallback } from "react";
import { markStepComplete } from "@/services/learningStepsService";
import { LearningStepData } from "./types";

export const useStepCompletion = (
  setSteps: React.Dispatch<React.SetStateAction<LearningStepData[]>>
) => {
  const markStepAsComplete = useCallback(async (stepId: string) => {
    try {
      // Optimistically update UI first
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        )
      );

      await markStepComplete(stepId);

      return true;
    } catch (error) {
      console.error("Error marking step as complete:", error);

      // Revert optimistic update if server update fails
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, completed: false } : step
        )
      );

      return false;
    }
  }, [setSteps]);

  return { markStepAsComplete };
};
