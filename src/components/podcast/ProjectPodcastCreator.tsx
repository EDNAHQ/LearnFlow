
import React, { memo } from 'react';
import { useLearningSteps } from '@/hooks/useLearningSteps';
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
  
  // Prepare content only once to avoid re-renders
  const combinedContent = React.useMemo(() => {
    return steps.map(step => step.title + ": " + (step.detailed_content || step.content || '')).join("\n\n");
  }, [steps]);
  
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
    <div className="h-full min-h-[calc(100vh-12rem)] w-full max-w-[860px] mx-auto">
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h1 className="text-2xl font-bold text-brand-purple mb-2">Create Podcast</h1>
        <p className="text-gray-600">
          Generate a conversational podcast about "{topic}" to help reinforce your learning.
        </p>
      </div>
      
      <div className="bg-[#1A1A1A] text-white rounded-xl p-6 shadow-lg min-h-[calc(100vh-20rem)]">
        <PodcastCreator
          key={`podcast-creator-content-${pathId}`}
          topic={topic}
          pathId={pathId}
          initialTranscript=""
          content={combinedContent}
          title={`Complete ${topic} Learning Project`}
        />
      </div>
    </div>
  );
};

// Using memo to prevent unnecessary re-renders
export default memo(ProjectPodcastCreator);
