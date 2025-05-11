
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLearningSteps } from "@/hooks/useLearningSteps";
import { useTopicManagement } from "@/hooks/navigation/useTopicManagement";
import { useStepNavigation } from "@/hooks/navigation/useStepNavigation";
import { useContentGeneration } from "@/hooks/navigation/useContentGeneration";

export const useContentNavigation = () => {
  const { pathId, stepId } = useParams();
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
  } = useContentGeneration(steps, pathId || null, topic, stepId || null);

  // Set step from URL parameter if available
  useEffect(() => {
    initializeStep(stepId || null);
  }, [stepId, initializeStep]);

  // Update generation status from useLearningSteps
  useEffect(() => {
    if (steps.length > 0) {
      updateGenerationStatus(bgGenerating, bgGenerated, steps.length, !!stepId);
    }
  }, [bgGenerating, bgGenerated, steps.length, stepId, updateGenerationStatus]);

  // Handle redirect to first step when generation completes
  useEffect(() => {
    // Only redirect if we're not already on a step page and generation is complete
    if (!hasRedirected && !initialLoading && !generatingContent && pathId && steps.length > 0 && !stepId) {
      console.log("Content generation complete. Navigating to first content page...");
      setHasRedirected(true);
      navigateToStep(0);
    }
  }, [generatingContent, generatedSteps, steps.length, pathId, hasRedirected, stepId, initialLoading, navigateToStep]);

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
