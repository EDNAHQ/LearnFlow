
import React, { memo, useCallback, useMemo } from 'react';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import ProjectPodcastCreator from '../podcast/ProjectPodcastCreator';
import { BarLoader } from '@/components/ui/loader';

interface PodcastModeDisplayProps {
  pathId?: string;
  topic?: string;
}

const PodcastModeDisplay: React.FC<PodcastModeDisplayProps> = ({
  pathId,
  topic
}) => {
  // Create a unique id for this component instance - more stable than Date.now()
  const instanceId = useMemo(() => `podcast-creator-${pathId}-${Math.random().toString(36).substring(2, 9)}`, [pathId]);
  
  // Use a stable key based on this id
  const stableKey = useMemo(() => `podcast-display-${instanceId}`, [instanceId]);
  
  // Use a callback for memoization
  const { steps, isLoading } = useLearningSteps(pathId || null, topic || null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 w-full max-w-[860px] mx-auto">
        <BarLoader className="mx-auto mb-4" />
        <p className="text-gray-600">Loading project content...</p>
      </div>
    );
  }

  if (!pathId || !topic) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md w-full max-w-[860px] mx-auto">
        Project information is missing. Please go back to your projects and try again.
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-12rem)]">
      <ProjectPodcastCreator
        key={stableKey}
        pathId={pathId}
        topic={topic}
        steps={steps}
      />
    </div>
  );
};

// Using a more thorough custom comparison function
export default memo(PodcastModeDisplay, (prevProps, nextProps) => {
  return prevProps.pathId === nextProps.pathId && prevProps.topic === nextProps.topic;
});
