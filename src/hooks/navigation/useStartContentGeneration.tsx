import { useEffect, useRef } from "react";
import { startBackgroundContentGeneration } from "@/utils/learning/backgroundContentGeneration";
import { Step } from "@/components/LearningStep";

/**
 * Hook to initiate background content generation for all steps.
 * Calls the optional onStart callback when generation begins.
 */
export function useStartContentGeneration(
  steps: any[],
  pathId: string | null,
  topic: string | null,
  stepId: string | null,
  onStart?: () => void
) {
  const startedRef = useRef<boolean>(false);

  useEffect(() => {
    if (steps.length > 0 && pathId && topic && !startedRef.current && !stepId) {
      console.log(`Starting background content generation for ${steps.length} steps`);
      onStart?.();
      startedRef.current = true;

      const stepsForGeneration: Step[] = steps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.content || ""
      }));

      startBackgroundContentGeneration(stepsForGeneration, topic, pathId).catch(err => {
        console.error("Error starting background generation:", err);
      });
    }
  }, [steps, pathId, topic, stepId, onStart]);
}
