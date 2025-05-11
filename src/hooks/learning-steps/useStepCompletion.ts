
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

      // Then update the database
      const { error } = await supabase
        .from('learning_steps')
        .update({ completed: true })
        .eq('id', stepId);

      if (error) {
        console.error("Error marking step as complete:", error);

        // Revert optimistic update if server update fails
        setSteps(prevSteps =>
          prevSteps.map(step =>
            step.id === stepId ? { ...step, completed: false } : step
          )
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error marking step as complete:", error);
      return false;
    }
  }, [setSteps]);

  return { markStepAsComplete };
};
