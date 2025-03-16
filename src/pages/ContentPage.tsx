
import { useEffect, useState, useRef } from "react";
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

const ContentPage = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { setMode } = useContentMode();
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
  
  // Use the custom hook instead of calling the component as a function
  const { completePath, isSubmitting, projectCompleted } = useProjectCompletion(
    pathId, 
    () => goToProjects() // Directly use goToProjects as the onComplete callback
  );
  
  // Set "text" (Read) mode by default when component mounts
  useEffect(() => {
    setMode("text");
  }, [setMode]);
  
  // Always show nugget loading screen when content is generating
  if (isLoading || generatingContent) {
    return (
      <KnowledgeNuggetLoading 
        topic={topic} 
        goToProjects={goToProjects}
        generatingContent={generatingContent}
        generatedSteps={generatedSteps}
        totalSteps={steps.length}
      />
    );
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
          
          {/* Add the title of the current step here */}
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            {currentStepData?.title || "Loading..."}
          </h1>

          <div className="mb-4 w-full">
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
