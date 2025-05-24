import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook to track background generation progress for learning content.
 * Exposes a callback to update progress and a handler for generation start.
 */
export function useGenerationStatus(
  stepsLength: number,
  stepId: string | null
) {
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Throttle updates to prevent excessive re-renders
  const lastUpdateTime = useRef<number>(Date.now());
  const updateThreshold = 2000;

  // Called when generation is initiated
  const handleGenerationStart = useCallback(() => {
    setGeneratingContent(true);
  }, []);

  const updateGenerationStatus = useCallback(
    (bgGenerating: boolean, bgGenerated: number) => {
      const now = Date.now();
      if (now - lastUpdateTime.current > updateThreshold) {
        lastUpdateTime.current = now;

        const shouldShowGenerating = bgGenerating && !stepId;
        setGeneratingContent(prev =>
          shouldShowGenerating !== prev ? shouldShowGenerating : prev
        );
        setGeneratedSteps(prev => (bgGenerated !== prev ? bgGenerated : prev));

        if (
          (!bgGenerating && stepsLength > 0 && bgGenerated >= stepsLength) ||
          stepId
        ) {
          setInitialLoading(false);
        }
      }
    },
    [updateThreshold, stepId, stepsLength]
  );

  // Automatically end initial loading after a timeout
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        if (initialLoading && stepsLength > 0 && generatedSteps > 0) {
          setInitialLoading(false);
        }
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [initialLoading, stepsLength, generatedSteps]);

  return {
    generatingContent,
    generatedSteps,
    initialLoading,
    updateGenerationStatus,
    handleGenerationStart,
  };
}
