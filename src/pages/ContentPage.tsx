
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useContentMode } from "@/hooks/useContentMode";
import { useContentNavigation } from "@/hooks/useContentNavigation";
import ContentDisplay from "@/components/ContentDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import ContentProgress from "@/components/content/ContentProgress";
import ContentNavigation from "@/components/content/ContentNavigation";
import ContentLoading from "@/components/content/ContentLoading";
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
    generatingContent,
    generatedSteps,
    handleMarkComplete,
    handleBack,
    goToProjects,
    isLastStep,
    currentStepData,
    topRef
  } = useContentNavigation();

  // Set "text" (Read) mode by default when component mounts
  useEffect(() => {
    setMode("text");
  }, [setMode]);

  const {
    completePath,
    isSubmitting,
    projectCompleted
  } = ProjectCompletion({
    pathId,
    onComplete: goToProjects
  });

  if (isLoading) {
    return <ContentLoading goToProjects={goToProjects} />;
  }

  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }

  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  return (
    <ContentPageLayout onGoToProjects={goToProjects} topRef={topRef}>
      <ContentHeader 
        onBack={handleBack}
        onHome={goToProjects}
        generatingContent={false}
        generatedSteps={0}
        totalSteps={steps.length}
      />

      <div className="w-full py-8 px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6 w-full">
            <ContentProgress 
              topic={topic} 
              currentStep={currentStep} 
              totalSteps={steps.length} 
            />
          </div>

          <div className="mb-6 w-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800 w-full">
                {currentStepData?.title}
              </h2>
            </div>
            <ContentDisplay 
              title={currentStepData?.title || ""}
              content={currentStepData?.content || "No content available for this step."}
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
