
import { AudioActions } from './types';

interface UseAudioActionsParams {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  editableScript: string;
  isGenerating: boolean;
  audioUrl: string | null;
  setEditableScript: (script: string) => void;
  setShowScriptEditor: (show: boolean) => void;
  setShowControls: (show: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  generateScript: (steps: any[], topic: string) => Promise<string | null>;
  generateSpeech: (script: string) => Promise<string | null>;
  cleanup: () => void;
  steps: any[];
  topic: string;
}

export const useAudioActions = ({
  audioRef,
  isPlaying,
  isMuted,
  editableScript,
  isGenerating,
  audioUrl,
  setEditableScript,
  setShowScriptEditor,
  setShowControls,
  setIsMuted,
  generateScript,
  generateSpeech,
  cleanup,
  steps,
  topic
}: UseAudioActionsParams): AudioActions => {
  
  // Script generation function
  const handleGenerateScript = async () => {
    if (steps.length > 0) {
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

  // Audio generation function
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

  // Toggle play with auto-generation
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

  // Mute toggle function
  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Reset function
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

  // Handle audio end
  const handleAudioEnd = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.currentTime) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  return {
    setEditableScript,
    setShowScriptEditor,
    setShowControls,
    handleGenerateScript,
    handleGenerateAudio,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry,
    handleAudioEnd
  };
};
