
import { useState, useRef, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

export const useAudioPlayer = (initialScript: string = '') => {
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsAudioLoaded(true);
      console.log("Audio URL loaded into player:", audioUrl);
    }
  }, [audioUrl]);

  const handleTogglePlay = async (script?: string) => {
    if (!audioUrl && !isGenerating && script) {
      console.log("Generating speech...");
      try {
        await generateSpeech(script);
      } catch (err) {
        console.error("Failed to generate speech:", err);
      }
    } else if (audioRef.current) {
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

  const handleRetry = async (script: string) => {
    if (!isGenerating) {
      try {
        cleanup();
        console.log("Regenerating speech...");
        await generateSpeech(script);
      } catch (err) {
        console.error("Failed to regenerate speech:", err);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

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
    isAudioLoaded,
    showControls,
    isGenerating,
    audioUrl,
    error,
    setShowControls,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry,
    handleAudioEnd
  };
};
