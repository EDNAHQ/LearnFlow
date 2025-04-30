
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export const useAudioPlayback = (audioUrl: string | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      console.log("Setting audio source:", audioUrl);
      
      // Reset error state when setting new URL
      setLocalError(null);
      setIsAudioLoaded(false);
      
      // Add query param to bust cache if we've had a previous load attempt
      const urlWithCacheBust = loadAttempts > 0 
        ? `${audioUrl}${audioUrl.includes('?') ? '&' : '?'}cb=${Date.now()}` 
        : audioUrl;
      
      // Set the audio source and attempt to load it
      audioRef.current.src = urlWithCacheBust;
      audioRef.current.load();
      
      const handleCanPlay = () => {
        console.log("Audio can now play");
        setIsAudioLoaded(true);
        setLocalError(null);
      };
      
      const handleError = (e: Event) => {
        const audioElement = e.currentTarget as HTMLAudioElement;
        console.error("Audio element error:", e, audioElement.error);
        
        // Increment load attempts for future retries
        setLoadAttempts(prev => prev + 1);
        
        // Provide more specific error message based on error code
        let errorMessage = "Unknown playback error";
        if (audioElement.error) {
          switch (audioElement.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "Playback aborted by the user";
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading audio";
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Audio decoding error";
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Audio format not supported by your browser";
              break;
            default:
              errorMessage = `Error code: ${audioElement.error.code}`;
          }
        }
        
        setLocalError(`Audio playback error: ${errorMessage}`);
        setIsAudioLoaded(false);
        toast.error(`Audio error: ${errorMessage}. Try refreshing or generating again.`);
      };
      
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleError);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [audioUrl, loadAttempts]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedData = () => setIsAudioLoaded(true);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const playAudio = () => {
    if (audioRef.current) {
      try {
        // Force reload if we've had errors before
        if (localError) {
          audioRef.current.load();
          setLocalError(null);
        }
        
        const playPromise = audioRef.current.play();
        
        // Handle the play promise to catch any autoplay restrictions
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playback prevented:", error);
            setLocalError(`Playback error: ${error.message}. Try clicking play again.`);
            toast.error("Playback prevented. Try clicking play again.");
          });
        }
      } catch (err: any) {
        console.error("Error playing audio:", err);
        setLocalError(`Playback error: ${err.message || 'Unknown error'}`);
        toast.error(`Error playing audio: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
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
    localError,
    setLocalError,
    playAudio,
    pauseAudio,
    toggleMute,
    loadAttempts,
    setLoadAttempts
  };
};
