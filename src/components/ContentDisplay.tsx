
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLearningSteps, LearningStepData } from "@/hooks/useLearningSteps";
import { useContentMode } from "@/hooks/useContentMode";
import TextModeDisplay from "./content/TextModeDisplay";
import SlideModeDisplay from "./content/SlideModeDisplay";
import AudioModeDisplay from "./content/AudioModeDisplay";

interface ContentDisplayProps {
  content?: string;
  index?: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  title?: string;
  stepId?: string;
}

interface LearningStep {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  detailed_content?: string | null;
  order_index?: number;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  index = 0,
  detailedContent,
  pathId,
  topic,
  title,
  stepId
}) => {
  const { steps, isLoading, markStepAsComplete } = useLearningSteps(pathId, topic);
  const { mode } = useContentMode();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<LearningStep | undefined>(undefined);

  useEffect(() => {
    if (steps && steps.length > 0) {
      // If stepId is provided, find the index of that step
      if (stepId) {
        const index = steps.findIndex(step => step.id === stepId);
        if (index !== -1) {
          setCurrentStepIndex(index);
        } else {
          setCurrentStepIndex(0); // Reset to first step if stepId not found
        }
      } else {
        setCurrentStepIndex(0); // Default to first step if no stepId
      }
    }
  }, [steps, stepId]);

  useEffect(() => {
    if (steps && steps.length > 0 && currentStepIndex >= 0 && currentStepIndex < steps.length) {
      setCurrentStep(steps[currentStepIndex]);
    }
  }, [steps, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = async () => {
    if (currentStep) {
      const success = await markStepAsComplete(currentStep.id);
      if (success) {
        // Optimistically update the UI
        setCurrentStep(prevStep => ({ ...prevStep!, completed: true }));
      }
    }
  };

  // Handle question clicks for insights
  const handleQuestionClick = (question: string) => {
    console.log("Dispatching question event from ContentDisplay:", question);
    
    // Create a custom event to communicate with ContentInsightsManager
    const event = new CustomEvent("ai:insight-request", {
      detail: { question, topic }
    });
    
    // Dispatch the event so ContentInsightsManager can catch it
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return <div>Loading content...</div>;
  }

  if (!currentStep && !content) {
    return <div>No content available.</div>;
  }

  const displayContent = content || currentStep?.content || '';
  const displayTitle = title || currentStep?.title || '';
  const displayStepId = stepId || currentStep?.id || '';

  return (
    <div className="w-full">
      <div className="pb-8">
        {mode === "text" && (
          <TextModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            index={index}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
            onQuestionClick={handleQuestionClick}
          />
        )}
        
        {mode === "slides" && (
          <SlideModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
            onQuestionClick={handleQuestionClick}
          />
        )}
        
        {mode === "podcast" && (
          <AudioModeDisplay 
            content={detailedContent || displayContent}
            title={displayTitle}
            pathId={pathId || ''}
            stepId={displayStepId}
            topic={topic || ''}
          />
        )}
      </div>
    </div>
  );
};

export default ContentDisplay;
