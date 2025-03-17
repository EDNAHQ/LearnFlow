
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Play, Pause, Volume2, Loader2, VolumeX, RefreshCw } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';

interface TextToSpeechPlayerProps {
  text: string;
  title: string;
}

const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({ text, title }) => {
  const { isGenerating, audioUrl, error, generateSpeech, cleanup } = useTextToSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true); // Default to showing controls
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Create audio element when URL is available
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsAudioLoaded(true);
      console.log("Audio URL loaded into player:", audioUrl);
    }
  }, [audioUrl]);

  const handleTogglePlay = async () => {
    if (!audioUrl && !isGenerating) {
      // If no audio yet, generate it first
      console.log("Generating speech...");
      try {
        await generateSpeech(text);
      } catch (err) {
        console.error("Failed to generate speech:", err);
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
        // Generate new audio
        console.log("Regenerating speech...");
        await generateSpeech(text);
      } catch (err) {
        console.error("Failed to regenerate speech:", err);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow">
          <Button
            onClick={handleTogglePlay}
            disabled={isGenerating}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white hover:bg-gray-800 bg-purple-800"
            title={audioUrl ? (isPlaying ? "Pause" : "Play") : "Generate audio"}
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <div className="flex-1">
            <div className="text-sm font-medium truncate">
              {isGenerating ? 'Generating audio...' : (title || 'Listen to content')}
            </div>
            
            {/* Audio element - always visible */}
            <audio 
              ref={audioRef} 
              onEnded={handleAudioEnd}
              controls={showControls}
              className="w-full mt-2"
            />
            
            {isGenerating && <BarLoader className="w-full mt-2" />}
            
            {/* Show audio status message */}
            {!isGenerating && audioUrl && (
              <div className="text-xs text-gray-400 mt-1">
                {isPlaying ? 'Playing audio...' : (isAudioLoaded ? 'Audio ready to play' : 'Loading audio...')}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {audioUrl && !isGenerating && (
            <Button
              onClick={handleRetry}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-gray-800"
              title="Regenerate audio"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={handleMuteToggle}
            variant="ghost" 
            size="icon"
            disabled={!audioUrl}
            className="h-8 w-8 text-white hover:bg-gray-800"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={() => setShowControls(!showControls)}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:bg-gray-800"
          >
            {showControls ? "Hide Controls" : "Show Controls"}
          </Button>
        </div>
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="mt-2 text-xs text-red-400">
          Error: {error}. Please try again.
        </div>
      )}
    </div>
  );
};

export default TextToSpeechPlayer;
