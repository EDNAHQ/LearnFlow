
import { useState, useRef, useEffect, useCallback } from "react";
import { Step } from "@/components/learning/LearningStep";

export function useContentGeneration(steps: any[], pathId: string | null, topic: string | null, stepId: string | null) {
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const contentGenerationStarted = useRef<boolean>(false);
  
  // Track last update time to throttle updates
  const lastUpdateTime = useRef<number>(Date.now());
  const UPDATE_THRESHOLD_MS = 2000; // Only update every 2 seconds

  // Removed background fan-out. Content is generated per-step on first view.
  useEffect(() => {
    if (steps.length > 0 && pathId && topic && !stepId) {
      // Keep initial state consistent; actual generation status comes from useLearningSteps updates
      setGeneratingContent(false);
    }
  }, [steps, pathId, topic, stepId]);

  // Update generation status when background process progresses
  const updateGenerationStatus = useCallback((bgGenerating: boolean, bgGenerated: number, stepsLength: number, hasStepId: boolean) => {
    const now = Date.now();
    const isGenerationComplete = !bgGenerating && stepsLength > 0 && bgGenerated >= stepsLength;

    // Always update immediately when generation completes to avoid stale notifications
    // For in-progress updates, throttle to prevent excessive re-renders
    const shouldUpdate = isGenerationComplete || (now - lastUpdateTime.current > UPDATE_THRESHOLD_MS);

    if (shouldUpdate) {
      if (isGenerationComplete) {
        lastUpdateTime.current = now;
      }

      // Only update if values changed to prevent unnecessary re-renders
      // Show generating status even when on a step page so users can see progress
      setGeneratingContent(prev => bgGenerating !== prev ? bgGenerating : prev);
      setGeneratedSteps(prev => bgGenerated !== prev ? bgGenerated : prev);

      // Only set initialLoading to false when content generation is complete or after a timeout
      if (isGenerationComplete || hasStepId) {
        setInitialLoading(false);
      }
    }
  }, []);

  // Add a timeout to eventually disable initial loading after 30 seconds
  // This gives edge functions enough time to start generating content
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        if (initialLoading && steps.length > 0 && generatedSteps > 0) {
          console.log("Loading timeout reached, ending loading state despite incomplete generation");
          setInitialLoading(false);
        }
      }, 30000); // 30 second timeout to accommodate edge function startup time

      return () => clearTimeout(timer);
    }
  }, [initialLoading, steps.length, generatedSteps]);

  return {
    generatingContent,
    generatedSteps,
    initialLoading,
    updateGenerationStatus
  };
}
