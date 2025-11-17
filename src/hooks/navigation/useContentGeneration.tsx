
import { useState, useRef, useEffect, useCallback } from "react";
import { Step } from "@/components/learning/LearningStep";

export function useContentGeneration(steps: any[], pathId: string | null, topic: string | null, stepId: string | null) {
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const contentGenerationStarted = useRef<boolean>(false);
  
  // Track last update time to throttle updates
  const lastUpdateTime = useRef<number>(Date.now());
  const updateThreshold = 2000; // Only update every 2 seconds

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
    if (now - lastUpdateTime.current > updateThreshold) {
      lastUpdateTime.current = now;
      
      // Only update if values changed to prevent unnecessary re-renders
      // Show generating status even when on a step page so users can see progress
      setGeneratingContent(prev => bgGenerating !== prev ? bgGenerating : prev);
      setGeneratedSteps(prev => bgGenerated !== prev ? bgGenerated : prev);
      
      // Only set initialLoading to false when content generation is complete or after a timeout
      if ((!bgGenerating && stepsLength > 0 && bgGenerated >= stepsLength) || hasStepId) {
        setInitialLoading(false);
      }
    }
  }, [updateThreshold]);

  // Add a timeout to eventually disable initial loading after 10 seconds
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        if (initialLoading && steps.length > 0 && generatedSteps > 0) {
          console.log("Loading timeout reached, ending loading state despite incomplete generation");
          setInitialLoading(false);
        }
      }, 10000); // 10 second timeout
      
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
