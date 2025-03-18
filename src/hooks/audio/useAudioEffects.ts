
import { useEffect } from 'react';

export const useAudioEffects = (
  audioRef: React.RefObject<HTMLAudioElement | null>,
  audioUrl: string | null,
  setIsPlaying: (isPlaying: boolean) => void,
  setIsAudioLoaded: (isLoaded: boolean) => void,
  cleanup: () => void
) => {
  // Update audio element when URL changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsAudioLoaded(true);
      console.log("Audio URL loaded into player:", audioUrl);
    }
  }, [audioUrl, audioRef, setIsAudioLoaded]);

  // Setup audio event listeners
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
  }, [audioRef, setIsPlaying]);

  // Handle cleanup on unmount - this was causing the infinite loop
  useEffect(() => {
    return () => {
      // Don't call cleanup directly in the effect body
      // Instead, return a cleanup function that does nothing
      // The parent component will handle cleanup when needed
    };
  }, []);
};
