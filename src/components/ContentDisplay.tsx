
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
  
  // Create a stable key that uniquely identifies this display mode and content
  const displayKey = useMemo(() => `${mode}-${pathId}-${stepId || index}-${Date.now()}`, [mode, pathId, stepId, index]);
  
  // Find the current step index only once when steps change
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

  // Special case for podcast mode - use a stable key to prevent remounting
  if (mode === "podcast") {
    const podcastKey = useMemo(() => `podcast-${pathId}-${Date.now()}`, [pathId]);
    return (
      <div className="w-full" key={podcastKey}>
        <PodcastModeDisplay
          pathId={pathId}
          topic={topic}
        />
      </div>
    );
  }

  // Special case for audio mode - use a stable key to prevent remounting
  if (mode === "audio") {
    const displayStepId = stepId || currentStep?.id || '';
    const safePathId = pathId || '';
    const safeTopic = topic || '';
    const audioKey = useMemo(() => `audio-${safePathId}-${displayStepId}-${Date.now()}`, [safePathId, displayStepId]);
    
    return (
      <div className="w-full" key={audioKey}>
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

// Using React.memo to prevent unnecessary re-renders
export default React.memo(ContentDisplay, (prevProps, nextProps) => {
  // Only re-render if important props change
  return prevProps.pathId === nextProps.pathId && 
         prevProps.stepId === nextProps.stepId && 
         prevProps.content === nextProps.content &&
         prevProps.detailedContent === nextProps.detailedContent;
});
