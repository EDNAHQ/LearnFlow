
import React, { memo, useEffect, useMemo } from 'react';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import { BarLoader } from '@/components/ui/loader';
import AudioControls from './AudioControls';
import ScriptEditor from './ScriptEditor';
import AudioErrorDisplay from './AudioErrorDisplay';
import AudioElement from './AudioElement';
import { useAudioPlayer } from '@/hooks/audio/useAudioPlayer';

interface AudioSummaryPlayerProps {
  pathId: string;
  stepId?: string;
  topic: string;
  initialScript?: string | null;
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({ 
  pathId, 
  stepId,
  topic,
  initialScript = null
}) => {
  const { steps, isLoading } = useLearningSteps(pathId, topic);
  
  // Create a stable component ID
  const stableId = useMemo(() => `audio-player-${pathId}-${stepId}`, [pathId, stepId]);
  
  const {
    audioRef,
    isPlaying,
    isMuted,
    isGenerating,
    isGeneratingScript,
    isAudioLoaded,
    showControls,
    audioUrl,
    scriptContent,
    editableScript,
    showScriptEditor,
    error,
    setScriptContent,
    setEditableScript,
    setShowScriptEditor,
    setShowControls,
    handleGenerateScript,
    handleGenerateAudio,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry,
    handleAudioEnd
  } = useAudioPlayer(steps, topic, initialScript);

  // Set the initial script if provided and no script content yet
  useEffect(() => {
    if (initialScript && !scriptContent) {
      setScriptContent(initialScript);
      setEditableScript(initialScript);
    }
  }, [initialScript, scriptContent, setScriptContent, setEditableScript]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <BarLoader className="mx-auto" />
        <p className="mt-4 text-gray-600">Loading learning content...</p>
      </div>
    );
  }

  return (
    <div 
      key={stableId}
      className="audio-summary-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-6 my-4 min-h-[calc(100vh-24rem)]"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Project Audio Summary</h3>
        <p className="text-sm text-gray-400">
          Generate and listen to an audio summary of the entire learning project.
        </p>
      </div>

      <ScriptEditor 
        scriptContent={scriptContent}
        editableScript={editableScript}
        showScriptEditor={showScriptEditor}
        isGenerating={isGenerating}
        isGeneratingScript={isGeneratingScript}
        onEditScript={(value) => setEditableScript(value)}
        onToggleEditor={() => setShowScriptEditor(!showScriptEditor)}
        onGenerateAudio={handleGenerateAudio}
        onGenerateScript={handleGenerateScript}
      />

      <div className="flex items-center justify-between mt-4">
        <AudioControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          isGenerating={isGenerating}
          isAudioLoaded={isAudioLoaded}
          audioUrl={audioUrl}
          showControls={showControls}
          onTogglePlay={handleTogglePlay}
          onMuteToggle={handleMuteToggle}
          onRetry={handleRetry}
          onToggleControls={() => setShowControls(!showControls)}
        />
      </div>
      
      <AudioElement 
        audioRef={audioRef}
        onEnded={handleAudioEnd}
        showControls={showControls}
      />
      
      <AudioErrorDisplay error={error} stepsLength={steps.length} />
    </div>
  );
};

// Using memo with custom comparison to prevent unnecessary re-renders
export default memo(AudioSummaryPlayer, (prevProps, nextProps) => {
  return prevProps.pathId === nextProps.pathId && 
         prevProps.stepId === nextProps.stepId && 
         prevProps.topic === nextProps.topic;
});
