
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Play, Pause, Volume2, Loader2, VolumeX, RefreshCw } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import { toast } from 'sonner';

interface TextToSpeechPlayerProps {
  text: string;
  title: string;
}

const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({ text, title }) => {
  const { isGenerating, audioUrl, error, generateSpeech, cleanup } = useTextToSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(`Audio error: ${error}`);
    }
  }, [error]);

  // Create audio element when URL is available
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      
      // Auto-play when audio is generated
      audioRef.current.play().catch(err => {
        console.error("Error auto-playing audio:", err);
        toast.error("Couldn't auto-play audio. Please click play manually.");
      });
    }
  }, [audioUrl]);

  const handleTogglePlay = async () => {
    if (!audioUrl && !isGenerating) {
      // If no audio yet, generate it first
      try {
        toast.info("Generating audio...");
        await generateSpeech(text);
      } catch (err) {
        console.error("Failed to generate speech:", err);
        toast.error("Failed to generate speech");
      }
    } else if (audioRef.current) {
      // If audio exists, toggle play/pause
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          toast.error("Failed to play audio");
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
        // Generate new audio
        toast.info("Regenerating audio...");
        await generateSpeech(text);
      } catch (err) {
        console.error("Failed to regenerate speech:", err);
        toast.error("Failed to regenerate speech");
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

  return (
    <div className="text-to-speech-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-4 my-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleTogglePlay}
          disabled={isGenerating}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-gray-800"
          title={audioUrl ? (isPlaying ? "Pause" : "Play") : "Generate audio"}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className="text-sm font-medium truncate">
            {isGenerating ? 'Generating audio...' : (title || 'Listen to content')}
          </div>
          
          {audioUrl && (
            <audio 
              ref={audioRef} 
              onEnded={handleAudioEnd}
              className="hidden"
            />
          )}
          
          {isGenerating && <BarLoader className="w-full mt-2" />}
        </div>
        
        <div className="flex items-center gap-2">
          {audioUrl && !isGenerating && (
            <Button
              onClick={handleRetry}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-gray-800"
              title="Regenerate audio"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          
          <Button
            onClick={handleMuteToggle}
            variant="ghost" 
            size="icon"
            disabled={!audioUrl && !isPlaying}
            className="h-7 w-7 text-white hover:bg-gray-800"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-400">
          Error: {error}. Please try again.
        </div>
      )}
    </div>
  );
};

export default TextToSpeechPlayer;
