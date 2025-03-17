
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLearningSteps } from "@/hooks/useLearningSteps";
import { useContentMode } from "@/hooks/useContentMode";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TextModeDisplay from "./content/TextModeDisplay";
import SlideModeDisplay from "./content/SlideModeDisplay";
import PodcastModeDisplay from "./content/PodcastModeDisplay";
import AudioModeDisplay from '@/components/content/AudioModeDisplay';

interface ContentDisplayProps {
  content?: string;
  index?: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  title?: string;
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
  title
}) => {
  const { stepId } = useParams<{ pathId: string; stepId: string }>();
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
    <div className="w-full max-w-6xl mx-auto">
      <MainNav />
      
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h2 className="text-2xl font-bold">{displayTitle}</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handlePrev} disabled={currentStepIndex === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={currentStepIndex === steps.length - 1}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      <div className="px-4 pb-8">
        {mode === "text" && (
          <TextModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            index={index}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
          />
        )}
        
        {mode === "slides" && (
          <SlideModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            detailedContent={detailedContent}
          />
        )}
        
        {mode === "podcast" && (
          <PodcastModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            pathId={pathId}
            topic={topic}
          />
        )}

        {mode === "audio" && (
          <AudioModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            pathId={pathId}
            topic={topic}
          />
        )}
        
        <div className="mt-6 flex justify-between items-center">
          <p>Step {currentStepIndex + 1} of {steps.length}</p>
          <Button onClick={handleComplete} disabled={currentStep?.completed}>
            {currentStep?.completed ? "Completed" : "Mark as Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;
