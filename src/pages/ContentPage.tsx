
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useContentMode } from "@/hooks/useContentMode";
import { useContentNavigation } from "@/hooks/useContentNavigation";
import ContentDisplay from "@/components/ContentDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import ContentProgress from "@/components/content/ContentProgress";
import ContentNavigation from "@/components/content/ContentNavigation";
import KnowledgeNuggetLoading from "@/components/content/KnowledgeNuggetLoading";
import ContentError from "@/components/content/ContentError";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import { useProjectCompletion } from "@/components/content/ProjectCompletion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContentPageProps {
  initialMode?: "text" | "slides" | "podcast" | "audio";
}

const ContentPage = ({ initialMode }: ContentPageProps = {}) => {
  const {
    pathId,
    stepId
  } = useParams();
  const navigate = useNavigate();
  const {
    setMode,
    mode
  } = useContentMode();
  const {
    topic,
    currentStep,
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
  const isMobile = useIsMobile();

  // Track if we've already redirected to avoid loops
  const [hasRedirected, setHasRedirected] = useState(false);

  // Use the custom hook directly
  const {
    completePath,
    isSubmitting,
    projectCompleted
  } = useProjectCompletion(pathId, () => goToProjects());

  // Set initial mode from props or default to "text"
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    } else if (mode !== "podcast" && mode !== "audio") {
      setMode("text");
    }
  }, [setMode, initialMode, mode]);

  // Memoize the navigation handler to prevent unnecessary rerenders
  const handleComplete = useCallback(
    () => isLastStep ? completePath() : handleMarkComplete(),
    [isLastStep, completePath, handleMarkComplete]
  );

  // Handle generation complete redirect - only for text/slides modes
  useEffect(() => {
    // Skip redirect if in podcast or audio mode
    if (mode === "podcast" || mode === "audio") return;
    
    // Only redirect if we're not already on a step page and generation is complete
    if (!hasRedirected && 
        !isLoading && 
        !generatingContent && 
        pathId && 
        steps.length > 0 && 
        generatedSteps >= steps.length && 
        !stepId) {
      
      console.log("Content generation complete. Navigating to first content page...");
      setHasRedirected(true);
      navigate(`/content/${pathId}/step/0`);
    }
  }, [generatingContent, generatedSteps, steps.length, pathId, navigate, hasRedirected, stepId, isLoading, mode]);

  // Show loading screen ONLY when no stepId is present OR we're in initial loading state
  // Don't show loading for podcast or audio mode
  if ((isLoading || generatingContent) && !stepId && mode !== "podcast" && mode !== "audio") {
    return (
      <KnowledgeNuggetLoading 
        topic={topic} 
        goToProjects={goToProjects} 
        generatingContent={generatingContent} 
        generatedSteps={generatedSteps} 
        totalSteps={steps.length} 
        pathId={pathId} 
      />
    );
  }
  
  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }
  
  // Ensure content is a string
  const safeContent = typeof currentStepData?.content === 'string' 
    ? currentStepData.content 
    : currentStepData?.content 
      ? JSON.stringify(currentStepData.content) 
      : "No content available";
  
  // Skip step navigation for podcast and audio modes
  const showStepNavigation = mode !== "podcast" && mode !== "audio";
  
  return (
    <ContentPageLayout onGoToProjects={goToProjects} topRef={topRef}>
      <ContentHeader 
        onBack={handleBack} 
        onHome={goToProjects} 
        generatingContent={generatingContent} 
        generatedSteps={generatedSteps} 
        totalSteps={steps.length} 
      />

      <div className="container max-w-[860px] mx-auto my-0 py-[30px]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="w-full min-h-[calc(100vh-16rem)]"
        >
          {showStepNavigation && (
            <div className="flex justify-between items-center mb-3 w-full">
              <ContentProgress topic={topic} currentStep={currentStep} totalSteps={steps.length} />
            </div>
          )}
          
          {showStepNavigation && (
            <h1 className="text-2xl font-bold mb-4 py-[10px] text-brand-purple">
              {currentStepData?.title || "Loading..."}
            </h1>
          )}

          <div className="mb-4 w-full min-h-[calc(100vh-20rem)]">
            <ContentDisplay 
              content={safeContent} 
              index={currentStep} 
              detailedContent={currentStepData?.detailed_content} 
              pathId={pathId} 
              topic={topic}
              title={currentStepData?.title || ""}
              stepId={stepId}
            />
          </div>

          {showStepNavigation && (
            <div>
              <ContentNavigation 
                currentStep={currentStep} 
                totalSteps={steps.length} 
                onPrevious={handleBack} 
                onComplete={handleComplete} 
                isLastStep={isLastStep} 
                isSubmitting={isSubmitting} 
                projectCompleted={projectCompleted} 
              />
            </div>
          )}
        </motion.div>
      </div>
    </ContentPageLayout>
  );
};

export default ContentPage;
