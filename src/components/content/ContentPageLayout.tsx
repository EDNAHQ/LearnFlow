
import React, { useEffect, useState } from "react";
import { ContentHeader } from "@/components/content/ContentHeader";
import { ContentNavigation } from "@/components/content/ContentNavigation";
import ContentProgress from "@/components/content/ContentProgress";
import ProgressMessage from "@/components/content/ProgressMessage";
import RelatedTopicsSection from "@/components/content/RelatedTopicsSection";
import { LearningStepData } from "@/hooks/learning-steps/types";
import { useParams } from "react-router-dom";

interface ContentPageLayoutProps {
  children: React.ReactNode;
  title: string;
  steps?: LearningStepData[];
  currentStepIndex: number;
  onNavigate: (index: number) => void;
}

const ContentPageLayout = ({
  children,
  title,
  steps = [],
  currentStepIndex,
  onNavigate,
}: ContentPageLayoutProps) => {
  const { pathId } = useParams<{ pathId: string }>();
  const [completedSteps, setCompletedSteps] = useState(0);

  // Calculate completed steps
  useEffect(() => {
    if (steps && steps.length > 0) {
      const completed = steps.filter(step => step.completed).length;
      setCompletedSteps(completed);
    }
  }, [steps]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <ContentHeader title={title} pathId={pathId} />
        
        {steps && steps.length > 0 && (
          <ProgressMessage 
            completedSteps={completedSteps} 
            totalSteps={steps.length} 
          />
        )}
        
        <ContentProgress 
          currentStep={currentStepIndex} 
          totalSteps={steps?.length || 0} 
          steps={steps?.map(step => ({ id: step.id, title: step.title })) || []}
          onNavigate={onNavigate}
        />
        
        <div className="my-6">{children}</div>
        
        <ContentNavigation
          prev={currentStepIndex > 0 ? () => onNavigate(currentStepIndex - 1) : undefined}
          next={
            steps && currentStepIndex < steps.length - 1
              ? () => onNavigate(currentStepIndex + 1)
              : undefined
          }
        />
        
        {currentStepIndex === (steps?.length - 1) && (
          <RelatedTopicsSection currentTopic={title} />
        )}
      </div>
    </div>
  );
};

export default ContentPageLayout;
