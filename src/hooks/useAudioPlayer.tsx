
import { useState, useRef, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

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
