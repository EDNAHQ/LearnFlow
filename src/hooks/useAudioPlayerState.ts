
import { useState, useRef, useEffect } from 'react';

export const useAudioPlayerState = (audioUrl: string | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      // Reset states when new URL is provided
      setError(null);
      setIsAudioLoaded(false);
      
      // Set the audio source
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      console.log("Audio URL loaded into player:", audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => setIsPlaying(false);
    const handleLoadedData = () => setIsAudioLoaded(true);
    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      setError("Failed to play audio. Please try again.");
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnd);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnd);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setError("Failed to play audio. Please try again.");
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

  return {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    error,
    handleTogglePlay,
    handleMuteToggle
  };
};
