
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useContentMode } from "@/hooks/useContentMode";
import { useContentNavigation } from "@/hooks/useContentNavigation";
import ContentDisplay from "@/components/ContentDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import ContentProgress from "@/components/content/ContentProgress";
import ContentNavigation from "@/components/content/ContentNavigation";
import ContentLoader from "@/components/content/ContentLoader";
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

  // Set initial mode from props or default to "text"
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    } else if (mode !== "podcast" && mode !== "audio") {
      setMode("text");
    }
  }, [setMode, initialMode, mode]);

  // Create a stable key for the content
  const contentKey = useMemo(() => 
    `${pathId}-${stepId}-${mode}-${currentStep}`, 
    [pathId, stepId, mode, currentStep]
  );

  // Redirect to generation page if needed
  useEffect(() => {
    // Only redirect if content is loading and we're in text/slides mode (not podcast/audio)
    if (isLoading && 
        !stepId && 
        pathId && 
        mode !== "podcast" && 
        mode !== "audio" && 
        (!steps.length || !steps.some(s => s.detailed_content))) {
      console.log("Content needs generation, redirecting to generation page");
      navigate(`/generate/${pathId}`);
    }
  }, [isLoading, steps, pathId, stepId, navigate, mode]);

  // Use the custom hook directly
  const {
    completePath,
    isSubmitting,
    projectCompleted
  } = useProjectCompletion(pathId, () => goToProjects());

  // Memoize the navigation handler to prevent unnecessary rerenders
  const handleComplete = useCallback(
    () => isLastStep ? completePath() : handleMarkComplete(),
    [isLastStep, completePath, handleMarkComplete]
  );

  // Don't render podcast and audio modes in the same way as regular content
  if ((mode === "podcast" || mode === "audio") && !isLoading) {
    return (
      <ContentPageLayout onGoToProjects={goToProjects} topRef={topRef}>
        <ContentHeader 
          onBack={handleBack} 
          onHome={goToProjects} 
        />
        <div className="container max-w-[860px] mx-auto my-0 py-[30px]">
          <ContentDisplay 
            key={contentKey}
            pathId={pathId}
            topic={topic || ""}
            stepId={stepId}
          />
        </div>
      </ContentPageLayout>
    );
  }

  if (isLoading) {
    return (
      <ContentPageLayout onGoToProjects={goToProjects} topRef={topRef}>
        <ContentHeader 
          onBack={handleBack} 
          onHome={goToProjects} 
        />
        <div className="container max-w-[860px] mx-auto py-[30px] flex justify-center">
          <ContentLoader message="Loading content..." />
        </div>
      </ContentPageLayout>
    );
  }
  
  if (!topic || !pathId || !currentStepData) {
    return <ContentError goToProjects={goToProjects} />;
  }
  
  // Ensure content is a string
  const safeContent = typeof currentStepData?.content === 'string' 
    ? currentStepData.content 
    : currentStepData?.content 
      ? JSON.stringify(currentStepData.content) 
      : "No content available";
  
  return (
    <ContentPageLayout onGoToProjects={goToProjects} topRef={topRef}>
      <ContentHeader 
        onBack={handleBack} 
        onHome={goToProjects}
      />

      <div className="container max-w-[860px] mx-auto my-0 py-[30px]">
        <motion.div 
          key={contentKey}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
          className="w-full min-h-[calc(100vh-16rem)]"
        >
          <div className="flex justify-between items-center mb-3 w-full">
            <ContentProgress topic={topic} currentStep={currentStep} totalSteps={steps.length} />
          </div>
          
          <h1 className="text-2xl font-bold mb-4 py-[10px] text-brand-purple">
            {currentStepData?.title || "Loading..."}
          </h1>

          <div className="mb-4 w-full min-h-[calc(100vh-20rem)]">
            <ContentDisplay 
              key={contentKey}
              content={safeContent} 
              index={currentStep} 
              detailedContent={currentStepData?.detailed_content} 
              pathId={pathId} 
              topic={topic}
              title={currentStepData?.title || ""}
              stepId={currentStepData?.id}
            />
          </div>

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
        </motion.div>
      </div>
    </ContentPageLayout>
  );
};

export default ContentPage;
