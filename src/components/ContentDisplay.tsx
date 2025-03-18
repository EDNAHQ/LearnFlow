
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLearningSteps } from "@/hooks/useLearningSteps";
import { useContentMode } from "@/hooks/useContentMode";
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
      if (stepId) {
        const index = steps.findIndex(step => step.id === stepId);
        if (index !== -1) {
          setCurrentStepIndex(index);
        } else {
          setCurrentStepIndex(0);
        }
      } else {
        setCurrentStepIndex(0);
      }
    }
  }, [steps, stepId]);

  useEffect(() => {
    if (steps && steps.length > 0 && currentStepIndex >= 0 && currentStepIndex < steps.length) {
      setCurrentStep(steps[currentStepIndex]);
    }
  }, [steps, currentStepIndex]);

  // Special case for podcast mode
  if (mode === "podcast") {
    return (
      <div className="w-full">
        <PodcastModeDisplay
          pathId={pathId}
          topic={topic}
        />
      </div>
    );
  }

  // Special case for audio mode
  if (mode === "audio") {
    const displayStepId = stepId || currentStep?.id || '';
    const safePathId = pathId || '';
    const safeTopic = topic || '';
    
    return (
      <div className="w-full">
        <AudioModeDisplay
          pathId={safePathId}
          stepId={displayStepId}
          topic={safeTopic}
          content={detailedContent || content || ''}
          title={title || currentStep?.title || ''}
        />
      </div>
    );
  }

  if (isLoading) {
    return <div className="w-full">Loading content...</div>;
  }

  if (!currentStep && !content) {
    return <div className="w-full">No content available.</div>;
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
          />
        )}
        
        {mode === "slides" && (
          <SlideModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
          />
        )}
      </div>
    </div>
  );
};

export default ContentDisplay;
