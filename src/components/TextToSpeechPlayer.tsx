
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import { toast } from 'sonner';

interface TextToSpeechPlayerProps {
  text: string;
  title: string;
}

const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({ text, title }) => {
  const { isGenerating, audioUrl, error, generateSpeech, cleanup } = useTextToSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
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
      toast.error(error);
    }
  }, [error]);

  const handleTogglePlay = async () => {
    if (!audioUrl && !isGenerating) {
      try {
        await generateSpeech(text);
      } catch (err) {
        console.error("Failed to generate speech:", err);
      }
    } else if (audioRef.current) {
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
    <div className="text-to-speech-player rounded-md border border-gray-200 bg-[#1A1A1A] text-white p-4 my-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleTogglePlay}
          disabled={isGenerating}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-gray-800"
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
              src={audioUrl} 
              onEnded={handleAudioEnd}
              className="hidden"
            />
          )}
          
          {isGenerating && <BarLoader className="w-full mt-2" />}
        </div>
        
        <Volume2 className="h-4 w-4 opacity-70" />
      </div>
    </div>
  );
};

export default TextToSpeechPlayer;
