
import React from 'react';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import { useProjectPodcast } from '@/hooks/podcast/useProjectPodcast';
import PodcastCreator from './PodcastCreator';
import { BarLoader } from '@/components/ui/loader';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectPodcastCreatorProps {
  pathId: string;
  topic: string;
  steps?: any[];
}

const ProjectPodcastCreator: React.FC<ProjectPodcastCreatorProps> = ({
  pathId,
  topic,
  steps = []
}) => {
  const { isLoading: stepsLoading } = useLearningSteps(pathId, topic);
  const isMobile = useIsMobile();
  
  if (stepsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] w-full">
        <BarLoader className="mx-auto mb-4" />
        <p className="text-gray-600">Loading project content...</p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] w-full">
        <div className="max-w-md mx-auto text-center">
          <p className="text-lg font-medium mb-2">No content available</p>
          <p className="text-gray-600">This project doesn't have any content steps yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full min-h-[calc(100vh-12rem)] w-full ${isMobile ? 'px-2' : 'px-4'}`}>
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h1 className="text-2xl font-bold text-brand-purple mb-2">Create Podcast</h1>
        <p className="text-gray-600">
          Generate a conversational podcast about "{topic}" to help reinforce your learning.
        </p>
      </div>
      
      <div className="bg-[#1A1A1A] text-white rounded-xl p-6 shadow-lg min-h-[calc(100vh-20rem)]">
        <PodcastCreator
          topic={topic}
          pathId={pathId}
          steps={steps}
          displayHeader={false}
        />
      </div>
    </div>
  );
};

export default ProjectPodcastCreator;
