
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useContentMode } from "@/hooks/useContentMode";
import { useContentNavigation } from "@/hooks/useContentNavigation";
import ContentDisplay from "@/components/ContentDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import ContentProgress from "@/components/content/ContentProgress";
import ContentNavigation from "@/components/content/ContentNavigation";
import KnowledgeNuggetLoading from "@/components/content/KnowledgeNuggetLoading";
import ContentError from "@/components/content/ContentError";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import ProjectCompletion from "@/components/content/ProjectCompletion";

const ContentPage = () => {
  const { setMode } = useContentMode();
  const {
    topic,
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
  
  const [initialLoading, setInitialLoading] = useState(true);

  // Set "text" (Read) mode by default when component mounts
  useEffect(() => {
    setMode("text");
    
    // Set a timeout to disable initial loading state after content is loaded
    // or after a maximum timeout (30 seconds)
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [setMode]);
  
  // Update initial loading state when steps are loaded
  useEffect(() => {
    if (steps.length > 0 && !isLoading) {
      // Make sure we show the nuggets screen for at least 5 seconds for a better experience
      setTimeout(() => {
        setInitialLoading(false);
      }, 5000);
    }
  }, [steps, isLoading]);

  const {
    completePath,
    isSubmitting,
    projectCompleted
  } = ProjectCompletion({
    pathId,
    onComplete: goToProjects
  });

  // Always show nugget loading screen for initial experience
  if (initialLoading || isLoading) {
    return <KnowledgeNuggetLoading topic={topic} goToProjects={goToProjects} />;
  }

  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }

  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  // Ensure content is a string
  const safeContent = typeof currentStepData?.content === 'string' 
    ? currentStepData.content 
    : (currentStepData?.content ? JSON.stringify(currentStepData.content) : "No content available");

  return (
    <ContentPageLayout onGoToProjects={goToProjects} topRef={topRef}>
      <ContentHeader 
        onBack={handleBack}
        onHome={goToProjects}
        generatingContent={generatingContent}
        generatedSteps={generatedSteps}
        totalSteps={steps.length}
      />

      <div className="container max-w-[860px] mx-auto py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-3 w-full">
            <ContentProgress 
              topic={topic} 
              currentStep={currentStep} 
              totalSteps={steps.length} 
            />
          </div>

          <div className="mb-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-white w-full">
                {currentStepData?.title || "Loading..."}
              </h2>
            </div>
            <ContentDisplay 
              title={currentStepData?.title || ""}
              content={safeContent}
              index={currentStep}
              detailedContent={currentStepData?.detailed_content}
              pathId={pathId}
              topic={topic}
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
