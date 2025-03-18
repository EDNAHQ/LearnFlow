
import React, { memo, useMemo } from 'react';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import AudioSummaryPlayer from '@/components/content/audio/AudioSummaryPlayer';
import { BarLoader } from '@/components/ui/loader';

interface AudioModeDisplayProps {
  pathId: string;
  stepId: string;
  topic: string;
  content?: string;
  title?: string;
}

const AudioModeDisplay: React.FC<AudioModeDisplayProps> = ({
  pathId,
  stepId,
  topic,
  content,
  title
}) => {
  // Create a stable component key to prevent remounting
  const stableKey = useMemo(() => `audio-player-${pathId}-${stepId}`, [pathId, stepId]);
  
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
    <div className="w-full max-w-[860px] mx-auto min-h-[calc(100vh-12rem)]">
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h1 className="text-2xl font-bold text-brand-purple mb-2">Project Audio Summary</h1>
        <p className="text-gray-600">
          Generate and listen to an audio summary of your "{topic}" project.
        </p>
      </div>
      
      <AudioSummaryPlayer 
        key={stableKey}
        pathId={pathId} 
        stepId={stepId} 
        topic={topic} 
      />
    </div>
  );
};

// Using React.memo with custom comparison to prevent unnecessary re-renders
export default memo(AudioModeDisplay, (prevProps, nextProps) => {
  return prevProps.pathId === nextProps.pathId && 
         prevProps.stepId === nextProps.stepId && 
         prevProps.topic === nextProps.topic;
});
