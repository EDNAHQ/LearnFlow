
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  const routeParams = useParams();
  const resolvedPathId = pathId || routeParams.pathId || '';
  const resolvedStepId = stepId || routeParams.stepId || '';
  
  // Only fetch steps if we're not in podcast or audio mode to prevent double fetching
  const { mode } = useContentMode();
  const skipFetching = mode === "podcast" || mode === "audio";
  
  const { steps, isLoading } = useLearningSteps(
    skipFetching ? null : resolvedPathId,
    skipFetching ? null : topic
  );
  
  const [currentStep, setCurrentStep] = useState<LearningStep | undefined>(undefined);
  
  // Create a stable unique identifier that won't change on re-renders
  const instanceId = useMemo(() => 
    `content-display-${resolvedPathId}-${resolvedStepId}-${Math.random().toString(36).slice(2, 9)}`, 
    [resolvedPathId, resolvedStepId]
  );
  
  // Create a stable key that uniquely identifies this display instance
  const displayKey = useMemo(() => 
    `${instanceId}-${mode}`, 
    [instanceId, mode]
  );
  
  // Find the current step index only once when steps change
  const currentStepIndex = useMemo(() => {
    if (steps && steps.length > 0 && resolvedStepId) {
      const index = steps.findIndex(step => step.id === resolvedStepId);
      return index !== -1 ? index : 0;
    }
    return 0;
  }, [steps, resolvedStepId]);
  
  // Set the current step based on the index
  useEffect(() => {
    if (steps && steps.length > 0 && currentStepIndex >= 0 && currentStepIndex < steps.length) {
      setCurrentStep(steps[currentStepIndex]);
    }
  }, [steps, currentStepIndex]);

  // Memoized render functions to prevent unnecessary re-renders
  const renderPodcastMode = useCallback(() => {
    const podcastKey = `podcast-${resolvedPathId}-${instanceId}`;
    return (
      <div className="w-full" key={podcastKey}>
        <PodcastModeDisplay
          pathId={resolvedPathId}
          topic={topic}
        />
      </div>
    );
  }, [resolvedPathId, topic, instanceId]);

  const renderAudioMode = useCallback(() => {
    const displayStepId = resolvedStepId || currentStep?.id || '';
    const safePathId = resolvedPathId;
    const safeTopic = topic || '';
    const audioKey = `audio-${safePathId}-${displayStepId}-${instanceId}`;
    
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
  }, [resolvedPathId, resolvedStepId, currentStep, topic, detailedContent, content, title, instanceId]);

  const renderContent = useCallback(() => {
    if (isLoading && mode !== "podcast" && mode !== "audio") {
      return <div className="w-full">Loading content...</div>;
    }

    if (!currentStep && !content && mode !== "podcast" && mode !== "audio") {
      return <div className="w-full">No content available.</div>;
    }

    const displayContent = content || currentStep?.content || '';
    const displayTitle = title || currentStep?.title || '';

    if (mode === "text") {
      return (
        <TextModeDisplay
          content={detailedContent || displayContent}
          title={displayTitle}
          index={index}
          detailedContent={detailedContent}
          pathId={resolvedPathId}
          topic={topic}
        />
      );
    }
    
    if (mode === "slides") {
      return (
        <SlideModeDisplay
          content={detailedContent || displayContent}
          title={displayTitle}
          detailedContent={detailedContent}
          pathId={resolvedPathId}
          topic={topic}
        />
      );
    }

    return null;
  }, [mode, isLoading, currentStep, content, detailedContent, title, index, resolvedPathId, topic]);

  // Main render based on mode
  if (mode === "podcast") {
    return renderPodcastMode();
  }

  if (mode === "audio") {
    return renderAudioMode();
  }

  return (
    <div className="w-full" key={displayKey}>
      <div className="pb-8">
        {renderContent()}
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
