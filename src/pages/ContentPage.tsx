
import { useEffect, useState } from "react";
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
import StepPagination from "@/components/content/StepPagination";

const ContentPage = () => {
  const {
    pathId,
    stepId
  } = useParams();
  const navigate = useNavigate();
  const {
    setMode
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
    generatedSteps,
    navigateToStep
  } = useContentNavigation();

  // Track if we've already redirected to avoid loops
  const [hasRedirected, setHasRedirected] = useState(false);

  // Use the custom hook directly
  const {
    completePath,
    isSubmitting,
    projectCompleted
  } = useProjectCompletion(pathId, () => goToProjects());

  // Set "text" (Read) mode by default when component mounts
  useEffect(() => {
    setMode("text");
  }, [setMode]);

  // Handle generation complete redirect - only once
  useEffect(() => {
    // Only redirect if we're not already on a step page and generation is complete
    if (!hasRedirected && !isLoading && !generatingContent && pathId && steps.length > 0 && generatedSteps >= steps.length && !stepId) {
      console.log("Content generation complete. Navigating to first content page...");
      setHasRedirected(true);
      navigate(`/content/${pathId}/step/0`);
    }
  }, [generatingContent, generatedSteps, steps.length, pathId, navigate, hasRedirected, stepId, isLoading]);

  // Show loading screen ONLY when no stepId is present OR we're in initial loading state
  // This prevents the redirect loop when already on a step page
  if ((isLoading || generatingContent) && !stepId) {
    return <KnowledgeNuggetLoading topic={topic} goToProjects={goToProjects} generatingContent={generatingContent} generatedSteps={generatedSteps} totalSteps={steps.length} pathId={pathId} />;
  }
  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }
  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  // Ensure content is a string
  const safeContent = typeof currentStepData?.content === 'string' ? currentStepData.content : currentStepData?.content ? JSON.stringify(currentStepData.content) : "No content available";
  
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
          initial={{opacity: 0}} 
          animate={{opacity: 1}} 
          transition={{duration: 0.2, ease: "easeOut"}} 
          className="w-full"
        >
          <div className="flex justify-between items-center mb-3 w-full">
            <ContentProgress 
              topic={topic} 
              currentStep={currentStep} 
              totalSteps={steps.length} 
              steps={steps.map(step => ({ id: step.id, title: step.title }))}
              onNavigateToStep={navigateToStep}
            />
          </div>
          
          {/* Pagination below progress bar */}
          <div className="mb-6">
            <StepPagination 
              currentStep={currentStep}
              totalSteps={steps.length}
              onNavigate={(step) => navigateToStep(step)}
              steps={steps.map(step => ({ id: step.id, title: step.title }))}
            />
          </div>
          
          {/* Add the title of the current step here */}
          <h1 className="text-2xl font-bold mb-4 py-[10px] text-brand-purple">
            {currentStepData?.title || "Loading..."}
          </h1>

          <div className="mb-4 w-full">
            <ContentDisplay 
              content={safeContent} 
              index={currentStep} 
              detailedContent={currentStepData?.detailed_content} 
              pathId={pathId} 
              topic={topic}
              title={currentStepData?.title || ""} 
              stepId={currentStep.toString()}
            />
          </div>

          <div>
            <ContentNavigation currentStep={currentStep} totalSteps={steps.length} onPrevious={handleBack} onComplete={handleComplete} isLastStep={isLastStep} isSubmitting={isSubmitting} projectCompleted={projectCompleted} />
          </div>
        </motion.div>
      </div>
    </ContentPageLayout>
  );
};

export default ContentPage;
