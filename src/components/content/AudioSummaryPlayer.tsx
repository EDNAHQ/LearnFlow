
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Play, Pause, Loader2, FileText } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AudioControls } from './audio/AudioControls';
import { ScriptEditor } from './audio/ScriptEditor';
import { AudioError } from './audio/AudioError';

interface AudioSummaryPlayerProps {
  pathId: string;
  topic: string;
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({ pathId, topic }) => {
  const { steps, isLoading } = useLearningSteps(pathId, topic);
  const { isGeneratingScript, scriptContent, generateScript } = useTextToSpeech();
  
  const [editableScript, setEditableScript] = useState<string>('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  
  const {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    showControls,
    isGenerating,
    audioUrl,
    error,
    setShowControls,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry
  } = useAudioPlayer(editableScript);

  useEffect(() => {
    if (scriptContent && !editableScript) {
      setEditableScript(scriptContent);
    }
  }, [scriptContent, editableScript]);

  const handleGenerateScript = async () => {
    if (!isGeneratingScript && steps.length > 0) {
      console.log("Generating script for entire project...");
      try {
        const script = await generateScript(steps, topic || 'this topic');
        if (script) {
          setShowScriptEditor(true);
        }
      } catch (err) {
        console.error("Failed to generate script:", err);
      }
    }
  };

  const handleGenerateAudio = async () => {
    if (!isGenerating && editableScript) {
      await handleTogglePlay(editableScript);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8"><BarLoader className="mx-auto" /><p>Loading learning content...</p></div>;
  }

  return (
    <div className="audio-summary-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-4 my-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Project Audio Summary</h3>
        <p className="text-sm text-gray-400">
          Generate and listen to an audio summary of the entire learning project.
        </p>
      </div>

      {!scriptContent && !showScriptEditor && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleGenerateScript}
            disabled={isGeneratingScript || isLoading || steps.length === 0}
            className="bg-purple-700 hover:bg-purple-600 text-white"
          >
            {isGeneratingScript ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Project Summary Script
              </>
            )}
          </Button>
        </div>
      )}

      {scriptContent && showScriptEditor && (
        <ScriptEditor
          script={editableScript}
          isGenerating={isGenerating}
          onScriptChange={setEditableScript}
          onGenerateAudio={handleGenerateAudio}
          onToggleEditor={() => setShowScriptEditor(false)}
        />
      )}

      {scriptContent && !showScriptEditor && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowScriptEditor(true)}
          className="mb-3 text-xs"
        >
          Edit Script
        </Button>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow">
          <Button
            onClick={() => handleTogglePlay(editableScript)}
            disabled={isGenerating && !audioUrl}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white hover:bg-gray-800 bg-purple-800"
            title={audioUrl ? (isPlaying ? "Pause" : "Play") : "Generate audio"}
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <div className="flex-1">
            <div className="text-sm font-medium truncate">
              {isGenerating ? 'Generating audio...' : (isGeneratingScript ? 'Generating script...' : 'Project Audio Summary')}
            </div>
            
            <audio 
              ref={audioRef} 
              controls={showControls}
              className="w-full mt-2"
            />
            
            {(isGenerating || isGeneratingScript) && <BarLoader className="w-full mt-2" />}
            
            {!isGenerating && audioUrl && (
              <div className="text-xs text-gray-400 mt-1">
                {isPlaying ? 'Playing audio...' : (isAudioLoaded ? 'Audio ready to play' : 'Loading audio...')}
              </div>
            )}
          </div>
        </div>
        
        <AudioControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          showControls={showControls}
          isGenerating={isGenerating}
          audioUrl={audioUrl}
          onPlayPause={() => handleTogglePlay(editableScript)}
          onMuteToggle={handleMuteToggle}
          onRetry={() => handleRetry(editableScript)}
          onToggleControls={() => setShowControls(!showControls)}
        />
      </div>
      
      <AudioError 
        error={error} 
        noContent={steps.length === 0}
      />
    </div>
  );
};

export default AudioSummaryPlayer;
