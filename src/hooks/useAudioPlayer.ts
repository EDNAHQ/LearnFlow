import { useState, useRef, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { toast } from 'sonner';

export const useAudioPlayer = (initialScript: string = '', pathId?: string) => {
  const { 
    isGenerating, 
    audioUrl, 
    error, 
    generateSpeech, 
    cleanup 
  } = useTextToSpeech();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Combined error state
  const combinedError = error || localError;

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      
      const handleCanPlay = () => {
        console.log("Audio can now play");
        setIsAudioLoaded(true);
      };
      
      const handleError = (e: ErrorEvent) => {
        console.error("Audio element error:", e);
        setLocalError(`Audio playback error: ${e.message || 'Unknown error'}`);
        setIsAudioLoaded(false);
      };
      
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleError as EventListener);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError as EventListener);
        }
      };
    }
  }, [audioUrl]);

  const handleTogglePlay = async (script?: string, currentPathId?: string) => {
    setLocalError(null);
    
    if (!audioUrl && !isGenerating && script && currentPathId) {
      console.log("Generating speech from script with length:", script.length);
      try {
        const url = await generateSpeech(script, currentPathId);
        if (url) {
          toast.success("Audio generated successfully");
        }
      } catch (err: any) {
        console.error("Failed to generate speech:", err);
        setLocalError(err.message || "Failed to generate speech");
        toast.error(`Failed to generate audio: ${err.message || 'Unknown error'}`);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        console.log("Pausing audio");
        audioRef.current.pause();
      } else {
        console.log("Playing audio");
        try {
          await audioRef.current.play();
        } catch (err: any) {
          console.error("Error playing audio:", err);
          setLocalError(`Playback error: ${err.message || 'Unknown error'}`);
          toast.error(`Error playing audio: ${err.message || 'Unknown error'}`);
        }
      }
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRetry = async (script: string, currentPathId?: string) => {
    if (!isGenerating && currentPathId) {
      setLocalError(null);
      try {
        cleanup();
        console.log("Regenerating speech...");
        await generateSpeech(script, currentPathId);
      } catch (err: any) {
        console.error("Failed to regenerate speech:", err);
        setLocalError(err.message || "Failed to regenerate speech");
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => setIsAudioLoaded(true);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleAudioEnd);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [audioUrl]);

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    showControls,
    isGenerating,
    audioUrl,
    error: combinedError,
    setShowControls,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry,
    handleAudioEnd: () => setIsPlaying(false)
  };
};
