
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { type LearningStepData } from "./types";
import { useFetchLearningSteps } from "./useFetchLearningSteps";
import { useStepCompletion } from "./useStepCompletion";
import { useRealtimeUpdates } from "./useRealtimeUpdates";

export type { LearningStepData } from "./types";

export const useLearningSteps = (pathId: string | null, topic: string | null) => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<LearningStepData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);
  
  // Track if we've already fetched steps
  const initialFetchComplete = useRef<boolean>(false);

  // Function to count how many steps have detailed content - memoize as it's called frequently
  const countGeneratedSteps = useCallback((stepsArray: LearningStepData[]) => {
    return stepsArray.filter(step => !!step.detailed_content).length;
  }, []);

  // Import our extracted hooks
  const { fetchLearningSteps } = useFetchLearningSteps();
  const { markStepAsComplete } = useStepCompletion(setSteps);

  // Create a stable version that doesn't depend on generatedSteps to avoid infinite loops
  const fetchStepsRef = useRef<() => void>();

  fetchStepsRef.current = useCallback(() => {
    return fetchLearningSteps(
      pathId,
      countGeneratedSteps,
      setSteps,
      setGeneratedSteps,
      setGeneratingContent,
      generatedSteps
    );
  }, [pathId, countGeneratedSteps, fetchLearningSteps, generatedSteps]);

  const fetchSteps = useCallback(() => {
    return fetchStepsRef.current?.();
  }, [pathId]);

  // Initial fetch
  useEffect(() => {
    if (!pathId) return;
    
    // Fetch data immediately
    fetchSteps();
    
    // Mark loading as complete after initial fetch
    if (!initialFetchComplete.current) {
      setIsLoading(false);
      initialFetchComplete.current = true;
    }
  }, [pathId, fetchSteps]);

  // Set up realtime updates
  useRealtimeUpdates(
    pathId,
    countGeneratedSteps,
    setSteps,
    setGeneratedSteps,
    setGeneratingContent,
    generatedSteps,
    fetchSteps,
    steps.length
  );

  return {
    steps,
    isLoading,
    generatingContent,
    generatedSteps,
    markStepAsComplete,
    setSteps
  };
};
