
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
  const generatedStepsRef = useRef<number>(0);

  // Function to count how many steps have detailed content - memoize as it's called frequently
  const countGeneratedSteps = useCallback((stepsArray: LearningStepData[]) => {
    return stepsArray.filter(step => !!step.detailed_content).length;
  }, []);

  // Import our extracted hooks
  const { fetchLearningSteps } = useFetchLearningSteps();
  const { markStepAsComplete } = useStepCompletion(setSteps);

  // Reset state when path changes to avoid carrying over previous progress
  useEffect(() => {
    setSteps([]);
    setGeneratedSteps(0);
    generatedStepsRef.current = 0;
    setGeneratingContent(false);
    setIsLoading(true);
    initialFetchComplete.current = false;
  }, [pathId]);

  // Create a stable fetchSteps function - removed generatedSteps from dependencies
  const fetchSteps = useCallback(() => {
    return fetchLearningSteps(
      pathId,
      countGeneratedSteps,
      setSteps,
      setGeneratedSteps,
      setGeneratingContent,
      generatedStepsRef.current
    );
  }, [pathId, countGeneratedSteps, fetchLearningSteps]);

  // Keep the ref in sync with state to avoid dependency issues
  useEffect(() => {
    generatedStepsRef.current = generatedSteps;
  }, [generatedSteps]);

  // Initial fetch
  useEffect(() => {
    if (!pathId) return;
    
    const loadSteps = async () => {
      await fetchSteps();
      if (!initialFetchComplete.current) {
        setIsLoading(false);
        initialFetchComplete.current = true;
      }
    };
    
    loadSteps();
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
