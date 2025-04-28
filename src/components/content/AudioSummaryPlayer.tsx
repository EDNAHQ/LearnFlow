
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { ScriptEditor } from './audio/ScriptEditor';
import { AudioError } from './audio/AudioError';
import { toast } from 'sonner';
import { ScriptGenerationSection } from '../audio/ScriptGenerationSection';
import { AudioPlayerSection } from '../audio/AudioPlayerSection';

interface AudioSummaryPlayerProps {
  pathId: string;
  topic: string;
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({ pathId, topic }) => {
  const { steps, isLoading } = useLearningSteps(pathId, topic);
  const { 
    isGenerating: isGeneratingAudio, 
    audioUrl, 
    error: audioError,
    scriptContent,
    isGeneratingScript,
    generateScript,
    generateSpeech
  } = useTextToSpeech();
  
  const [editableScript, setEditableScript] = useState<string>('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [generationAttempted, setGenerationAttempted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    showControls,
    isGenerating,
    error: playerError,
    setShowControls,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry
  } = useAudioPlayer(editableScript, pathId);

  const error = audioError || playerError;

  useEffect(() => {
    if (scriptContent && !editableScript) {
      setEditableScript(scriptContent);
    }
  }, [scriptContent, editableScript]);

  const prepareDefaultScript = () => {
    if (!steps || steps.length === 0) return '';
    
    const introduction = `Here's a summary of what you'll learn about ${topic}:\n\n`;
    const stepsContent = steps.map((step, index) => {
      const content = step.detailed_content || step.content || '';
      const firstParagraph = content.split('\n')[0] || content.substring(0, 200);
      return `Step ${index + 1}: ${step.title}\n${firstParagraph}\n`;
    }).join('\n');
    
    return introduction + stepsContent;
  };

  const handleGenerateScript = async () => {
    if (!isGeneratingScript && steps.length > 0) {
      console.log("Generating script for entire project...");
      setGenerationAttempted(true);
      
      try {
        const script = await generateScript(steps, topic || 'this topic');
        
        if (script) {
          setShowScriptEditor(true);
          console.log("Script generation successful, length:", script.length);
          return;
        }
      } catch (err) {
        console.error("Error in script generation:", err);
      }
      
      const defaultScript = prepareDefaultScript();
      setEditableScript(defaultScript);
      setShowScriptEditor(true);
    }
  };

  return (
    <div className="audio-summary-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-4 my-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Project Audio Summary</h3>
        <p className="text-sm text-gray-400">
          Generate and listen to an audio summary of the entire learning project.
        </p>
      </div>

      {!scriptContent && !editableScript && !showScriptEditor && (
        <ScriptGenerationSection
          isGeneratingScript={isGeneratingScript}
          isLoading={isLoading}
          steps={steps}
          handleGenerateScript={handleGenerateScript}
        />
      )}

      {(scriptContent || editableScript) && showScriptEditor && (
        <ScriptEditor
          script={editableScript || scriptContent || ''}
          isGenerating={isGenerating}
          onScriptChange={setEditableScript}
          onGenerateAudio={() => handleTogglePlay(editableScript || scriptContent || '', pathId)}
          onToggleEditor={() => setShowScriptEditor(false)}
        />
      )}

      {(scriptContent || editableScript) && !showScriptEditor && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowScriptEditor(true)}
          className="mb-3 text-xs"
        >
          Edit Script
        </Button>
      )}

      <AudioPlayerSection
        isGenerating={isGenerating}
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        isMuted={isMuted}
        showControls={showControls}
        isAudioLoaded={isAudioLoaded}
        editableScript={editableScript}
        scriptContent={scriptContent}
        pathId={pathId}
        handleTogglePlay={handleTogglePlay}
        handleMuteToggle={handleMuteToggle}
        handleRetry={handleRetry}
        setShowControls={setShowControls}
        audioRef={audioRef}
      />
      
      <AudioError 
        error={error} 
        noContent={steps.length === 0}
        attempted={generationAttempted}
      />
      
      {debugInfo && (
        <div className="mt-2 p-2 bg-gray-800 text-xs text-yellow-400 rounded">
          Debug: {debugInfo}
        </div>
      )}
    </div>
  );
};

export default AudioSummaryPlayer;
