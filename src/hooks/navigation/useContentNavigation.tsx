
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useLearningSteps } from "@/hooks/learning-steps";
import { useTopicManagement } from "@/hooks/navigation/useTopicManagement";
import { useStepNavigation } from "@/hooks/navigation/useStepNavigation";
import { useContentGeneration } from "@/hooks/navigation/useContentGeneration";

export const useContentNavigation = () => {
  const { pathId, stepIndex } = useParams();
  const { user } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Get topic from session storage
  const { topic } = useTopicManagement(pathId || null, user);

  // Get learning steps data
  const {
    steps,
    isLoading: stepsLoading,
    markStepAsComplete,
    generatingContent: bgGenerating,
    generatedSteps: bgGenerated,
  } = useLearningSteps(pathId || null, topic);

  // Step navigation
  const {
    currentStep,
    topRef,
    handleMarkComplete,
    handleBack,
    goToProjects,
    navigateToStep,
    initializeStep,
    isLastStep
  } = useStepNavigation(pathId || null, steps);

  // Content generation status
  const {
    generatingContent,
    generatedSteps,
    initialLoading,
    updateGenerationStatus
  } = useContentGeneration(steps, pathId || null, topic, stepIndex || null);

  // Set step from URL parameter if available
  useEffect(() => {
    initializeStep(stepIndex || null);
  }, [stepIndex, initializeStep]);

  // Update generation status from useLearningSteps
  useEffect(() => {
    if (steps.length > 0) {
      updateGenerationStatus(bgGenerating, bgGenerated, steps.length, !!stepIndex);
    }
  }, [bgGenerating, bgGenerated, steps.length, stepIndex, updateGenerationStatus]);

  // Handle redirect to first step when generation completes
  useEffect(() => {
    // Only redirect if we're not already on a step page and generation is complete
    if (!hasRedirected && !initialLoading && !generatingContent && pathId && steps.length > 0 && !stepIndex) {
      console.log("Content generation complete. Navigating to first content page...");
      setHasRedirected(true);
      navigateToStep(0);
    }
    // Note: generatedSteps removed from deps to prevent cascading re-runs - we only care about generatingContent state
  }, [generatingContent, steps.length, pathId, hasRedirected, stepIndex, initialLoading, navigateToStep]);

  // Wrap markStepAsComplete to pass it to the step navigation hook
  const handleMarkCompleteWithStep = async () => {
    await handleMarkComplete(markStepAsComplete);
  };

  // Memoize current step data to prevent re-renders
  const currentStepData = useMemo(() => steps[currentStep], [steps, currentStep]);

  return {
    topic,
    currentStep,
    pathId: pathId || null,
    steps,
    isLoading: stepsLoading || initialLoading,
    generatingContent,
    generatedSteps,
    handleMarkComplete: handleMarkCompleteWithStep,
    handleBack,
    goToProjects,
    isLastStep,
    currentStepData,
    topRef,
    navigateToStep
  };
};
