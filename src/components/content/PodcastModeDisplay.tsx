
import React, { memo } from 'react';
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
  const { steps, isLoading } = useLearningSteps(pathId, topic);

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
        key={`podcast-creator-${pathId}`}
        pathId={pathId}
        topic={topic}
        steps={steps}
      />
    </div>
  );
};

// Using React.memo to prevent unnecessary re-renders
export default memo(PodcastModeDisplay);
