
import { Suspense } from "react";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import ContentErrorBoundary from "@/components/content/ContentErrorBoundary";
import ContentMainDisplay from "@/components/content/ContentMainDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import { useContentPageLogic } from "@/hooks/useContentPageLogic";

const ContentPage = () => {
  const {
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
    projectCompleted
  } = useContentPageLogic();

  return (
    <ContentPageLayout ref={topRef}>
      <ContentHeader 
        topic={topic} 
        pathId={pathId}
        isLoading={isLoading}
      />
      
      <ContentErrorBoundary 
        isLoading={isLoading}
        topic={topic}
        pathId={pathId}
        goToProjects={goToProjects}
      >
        <Suspense fallback={<div className="p-8 text-center">Loading content...</div>}>
          <ContentMainDisplay
            topic={topic}
            pathTitle={pathTitle}
            currentStep={currentStep}
            steps={steps}
            currentStepData={currentStepData}
            safeContent={safeContent}
            handleBack={handleBack}
            handleComplete={handleComplete}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
            projectCompleted={projectCompleted}
            pathId={pathId}
          />
        </Suspense>
      </ContentErrorBoundary>
    </ContentPageLayout>
  );
};

export default ContentPage;
