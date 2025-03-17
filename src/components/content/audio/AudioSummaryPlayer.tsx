
import React, { useState, useRef, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import { BarLoader } from '@/components/ui/loader';
import AudioControls from './AudioControls';
import ScriptEditor from './ScriptEditor';
import AudioErrorDisplay from './AudioErrorDisplay';

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
    isGenerating, 
    isGeneratingScript,
    audioUrl, 
    scriptContent,
    error, 
    generateSpeech, 
    generateScript,
    cleanup 
  } = useTextToSpeech();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [editableScript, setEditableScript] = useState<string>('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  useEffect(() => {
    if (scriptContent && !editableScript) {
      setEditableScript(scriptContent);
    }
  }, [scriptContent, editableScript]);

  // Create audio element when URL is available
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsAudioLoaded(true);
      console.log("Audio URL loaded into player:", audioUrl);
    }
  }, [audioUrl]);

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
      console.log("Generating audio from script...");
      try {
        await generateSpeech(editableScript);
      } catch (err) {
        console.error("Failed to generate audio:", err);
      }
    }
  };

  const handleTogglePlay = async () => {
    if (!audioUrl && !isGenerating) {
      // If no audio yet, check if we have a script
      if (editableScript) {
        await handleGenerateAudio();
      } else {
        // If no script, generate one first
        const script = await generateScript(steps, topic || 'this topic');
        if (script) {
          await generateSpeech(script);
        }
      }
    } else if (audioRef.current) {
      // If audio exists, toggle play/pause
      if (isPlaying) {
        console.log("Pausing audio");
        audioRef.current.pause();
      } else {
        console.log("Playing audio");
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      }
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRetry = async () => {
    if (!isGenerating) {
      try {
        // Clean up existing audio
        cleanup();
        // Reset the script editor state
        setEditableScript('');
        setShowScriptEditor(false);
      } catch (err) {
        console.error("Failed to reset:", err);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  // Update play state when audio plays or pauses
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [audioUrl]);

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
      
      {/* Audio element - always visible */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd}
        controls={showControls}
        className="w-full mt-2"
      />
      
      <AudioErrorDisplay error={error} stepsLength={steps.length} />
    </div>
  );
};

export default AudioSummaryPlayer;
