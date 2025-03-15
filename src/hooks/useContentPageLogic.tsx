
import { useEffect } from "react";
import { useContentMode } from "@/hooks/useContentMode";
import { useContentNavigation } from "@/hooks/useContentNavigation";
import ProjectCompletion from "@/components/content/ProjectCompletion";
import { toast } from "sonner";

export function useContentPageLogic() {
  const { setMode } = useContentMode();
  const {
    topic,
    pathTitle,
    currentStep,
    pathId,
    steps,
    isLoading,
    handleMarkComplete,
    handleBack,
    goToProjects,
    isLastStep,
    currentStepData,
    topRef,
    generatingContent,
    generatedSteps
  } = useContentNavigation();

  // Set "text" (Read) mode by default when component mounts
  useEffect(() => {
    setMode("text");
  }, [setMode]);

  // Show toast if data is still loading after 10 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        toast.error(
          "Content is taking longer than expected to load. Please refresh the page.", 
          { 
            id: "content-loading-timeout",
            duration: 5000
          }
        );
      }, 10000);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const {
    completePath,
    isSubmitting,
    projectCompleted
  } = ProjectCompletion({
    pathId,
    onComplete: goToProjects
  });

  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  // Ensure content is a string
  const safeContent = typeof currentStepData?.content === 'string' 
    ? currentStepData.content 
    : (currentStepData?.content ? JSON.stringify(currentStepData.content) : "No content available");

  return {
    topic,
    pathTitle,
    currentStep,
    pathId,
    steps,
    isLoading,
    handleComplete,
    handleBack,
    goToProjects,
    isLastStep,
    currentStepData,
    topRef,
    safeContent,
    isSubmitting,
    projectCompleted,
    generatingContent,
    generatedSteps
  };
}
