
import React, { useEffect, useState, useMemo } from "react";
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
  const { steps, isLoading } = useLearningSteps(pathId, topic);
  const { mode } = useContentMode();
  const [currentStep, setCurrentStep] = useState<LearningStep | undefined>(undefined);
  
  // Memoize the current step index to prevent unnecessary rerenders
  const currentStepIndex = useMemo(() => {
    if (steps && steps.length > 0 && stepId) {
      const index = steps.findIndex(step => step.id === stepId);
      return index !== -1 ? index : 0;
    }
    return 0;
  }, [steps, stepId]);
  
  // Set the current step based on the index
  useEffect(() => {
    if (steps && steps.length > 0 && currentStepIndex >= 0 && currentStepIndex < steps.length) {
      setCurrentStep(steps[currentStepIndex]);
    }
  }, [steps, currentStepIndex]);

  // Create a stable key for each display mode to prevent flickering
  const displayKey = useMemo(() => `${mode}-${pathId}-${stepId || index}`, [mode, pathId, stepId, index]);

  // Special case for podcast mode
  if (mode === "podcast") {
    return (
      <div className="w-full" key={`podcast-${pathId}`}>
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
      <div className="w-full" key={`audio-${pathId}`}>
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
    <div className="w-full" key={displayKey}>
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

export default React.memo(ContentDisplay);
