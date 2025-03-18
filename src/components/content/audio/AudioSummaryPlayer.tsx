
import React from 'react';
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
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({ 
  pathId, 
  stepId,
  topic 
}) => {
  const { steps, isLoading } = useLearningSteps(pathId, topic);
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
    setEditableScript,
    setShowScriptEditor,
    setShowControls,
    handleGenerateScript,
    handleGenerateAudio,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry,
    handleAudioEnd
  } = useAudioPlayer(steps, topic);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)]">
        <BarLoader className="mx-auto" />
        <p className="mt-4 text-gray-200">Loading learning content...</p>
      </div>
    );
  }

  return (
    <div className="audio-summary-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-6 my-4 min-h-[calc(100vh-16rem)]">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Project Audio Summary</h3>
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

      <div className="flex items-center justify-between">
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

export default AudioSummaryPlayer;
