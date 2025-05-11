
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
  const [showLoadingPage, setShowLoadingPage] = useState(true);

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

  // Add a timeout to hide loading page after certain period even if generation is still in progress
  useEffect(() => {
    if (showLoadingPage && (!isLoading && steps.length > 0)) {
      // If we have steps but generation is still happening, give it a bit of time then show content
      const timer = setTimeout(() => {
        if (generatedSteps > 0) {
          console.log("Showing content page after timeout with partial generation");
          setShowLoadingPage(false);
        }
      }, 10000); // Give it 10 seconds to start showing some progress
      
      return () => clearTimeout(timer);
    }
  }, [showLoadingPage, isLoading, steps.length, generatedSteps]);

  // Handle generation complete redirect - only redirect if we're not on a step page
  useEffect(() => {
    // Check if loading is completely done OR if we have enough steps generated
    const generationComplete = (!isLoading && !generatingContent) || 
                              (generatedSteps > 0 && generatedSteps === steps.length);
    
    // Only redirect if we're not already on a step page and generation is complete
    if (!hasRedirected && generationComplete && pathId && steps.length > 0 && !stepId) {
      console.log("Content generation complete. Navigating to first content page...");
      setHasRedirected(true);
      navigate(`/content/${pathId}/step/0`);
    }
    
    // If we have at least one step generated, we can start showing content
    if (showLoadingPage && generatedSteps > 0 && steps.length > 0) {
      const initialGenerationTimeout = setTimeout(() => {
        setShowLoadingPage(false);
      }, 3000); // Give it 3 seconds after the first step is generated
      
      return () => clearTimeout(initialGenerationTimeout);
    }
  }, [
    generatingContent, 
    generatedSteps, 
    steps.length, 
    pathId, 
    navigate, 
    hasRedirected, 
    stepId, 
    isLoading,
    showLoadingPage
  ]);

  // Handle question clicks for insights
  const handleQuestionClick = (question: string) => {
    console.log("Question clicked in ContentPage:", question);
    
    // Create a custom event to communicate with ContentInsightsManager
    const event = new CustomEvent("ai:insight-request", {
      detail: { question, topic }
    });
    
    // Dispatch the event so ContentInsightsManager can catch it
    window.dispatchEvent(event);
  };

  // Show loading screen ONLY when no stepId is present OR we're in initial loading state
  if ((isLoading || (generatingContent && showLoadingPage)) && !stepId) {
    return <KnowledgeNuggetLoading 
             topic={topic} 
             goToProjects={goToProjects} 
             generatingContent={generatingContent} 
             generatedSteps={generatedSteps} 
             totalSteps={steps.length} 
             pathId={pathId} 
           />;
  }
  
  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }
  
  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  // Ensure content is a string
  const safeContent = typeof currentStepData?.content === 'string' ? currentStepData.content : currentStepData?.content ? JSON.stringify(currentStepData.content) : "No content available";
  
  return (
    <ContentPageLayout 
      onGoToProjects={goToProjects} 
      topRef={topRef}
      topic={topic}
      currentContent={currentStepData?.detailed_content || safeContent}
      currentTitle={currentStepData?.title}
    >
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
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center mb-3 w-full">
              <ContentProgress 
                topic={topic} 
                currentStep={currentStep} 
                totalSteps={steps.length} 
                steps={steps.map(step => ({ id: step.id, title: step.title }))}
                onNavigateToStep={navigateToStep}
              />
            </div>
            
            <StepPagination
              currentStep={currentStep}
              totalSteps={steps.length}
              onNavigate={navigateToStep}
              steps={steps.map(step => ({ id: step.id, title: step.title }))}
            />
          </div>
          
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
              stepId={currentStepData?.id}
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
