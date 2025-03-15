
import { useEffect } from "react";
import { useContentMode } from "@/hooks/useContentMode";
import { useContentNavigation } from "@/hooks/useContentNavigation";
import ProjectCompletion from "@/components/content/ProjectCompletion";
import { toast } from "sonner";
import { generateStepContent } from "@/utils/learning/contentGeneration";

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
    generatedSteps,
    setSteps
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
  
  // Trigger content generation for the current step if no detailed content exists
  useEffect(() => {
    if (
      currentStepData && 
      currentStepData.id && 
      topic && 
      !currentStepData.detailed_content &&
      !isLoading
    ) {
      // This will generate content for the current step only when it's needed
      const generateContent = async () => {
        try {
          toast.loading(`Generating detailed content for this step...`, {
            id: `generating-step-${currentStepData.id}`,
            duration: 5000
          });
          
          const content = await generateStepContent(currentStepData, topic, false);
          
          // Update the steps in state with the new content
          setSteps(prevSteps => 
            prevSteps.map(step => 
              step.id === currentStepData.id
                ? { ...step, detailed_content: content }
                : step
            )
          );
          
          toast.success(`Content is ready!`, {
            id: `generating-step-${currentStepData.id}`,
            duration: 2000
          });
        } catch (error) {
          console.error("Failed to generate content:", error);
          toast.error(`Failed to generate content. Please try again.`, {
            id: `generating-step-${currentStepData.id}`,
            duration: 3000
          });
        }
      };
      
      generateContent();
    }
  }, [currentStepData, topic, isLoading, setSteps]);

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
