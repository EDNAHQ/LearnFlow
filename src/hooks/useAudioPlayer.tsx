
import { useState, useRef, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

// Separate hook for handling audio playback
const useAudioPlayback = (audioRef, audioUrl) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, audioUrl]);

  const togglePlay = async (audioRef) => {
    if (audioRef.current) {
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

  const toggleMute = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return {
    isPlaying,
    isMuted,
    togglePlay,
    toggleMute,
    setIsPlaying
  };
};

// Separate hook for handling script management
const useScriptManagement = (scriptContent) => {
  const [editableScript, setEditableScript] = useState<string>('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);

  useEffect(() => {
    if (scriptContent && !editableScript) {
      setEditableScript(scriptContent);
    }
  }, [scriptContent, editableScript]);

  return {
    editableScript,
    showScriptEditor,
    setEditableScript,
    setShowScriptEditor
  };
};

// Separate hook for handling audio initialization
const useAudioInitialization = (audioUrl, audioRef) => {
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsAudioLoaded(true);
      console.log("Audio URL loaded into player:", audioUrl);
    }
  }, [audioUrl, audioRef]);

  return {
    isAudioLoaded
  };
};

// Main hook that composes the other hooks
export const useAudioPlayer = (steps: any[], topic: string) => {
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
  
  const [showControls, setShowControls] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Compose the smaller hooks
  const {
    isPlaying,
    isMuted,
    togglePlay,
    toggleMute,
    setIsPlaying
  } = useAudioPlayback(audioRef, audioUrl);

  const {
    editableScript,
    showScriptEditor,
    setEditableScript,
    setShowScriptEditor
  } = useScriptManagement(scriptContent);

  const { isAudioLoaded } = useAudioInitialization(audioUrl, audioRef);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Script generation function
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
    } else {
      // If audio exists, toggle play/pause
      await togglePlay(audioRef);
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
    setIsPlaying(false);
  };

  const handleMuteToggle = () => {
    toggleMute(audioRef);
  };

  return {
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
  };
};
