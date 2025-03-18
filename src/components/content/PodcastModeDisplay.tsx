
import React from 'react';
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
      <div className="flex flex-col items-center justify-center py-8">
        <BarLoader className="mx-auto mb-4" />
        <p className="text-gray-600">Loading project content...</p>
      </div>
    );
  }

  if (!pathId || !topic) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Project information is missing. Please go back to your projects and try again.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      <ProjectPodcastCreator
        pathId={pathId}
        topic={topic}
        steps={steps}
      />
    </div>
  );
};

export default PodcastModeDisplay;
