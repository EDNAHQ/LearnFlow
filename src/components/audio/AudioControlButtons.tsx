
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, RefreshCw, Loader2 } from 'lucide-react';

interface AudioControlButtonsProps {
  isGenerating: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  audioUrl: string | null;
  onTogglePlay: () => void;
  onMuteToggle: () => void;
  onRetry: () => void;
}

export const AudioControlButtons = ({
  isGenerating,
  isPlaying,
  isMuted,
  audioUrl,
  onTogglePlay,
  onMuteToggle,
  onRetry
}: AudioControlButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onTogglePlay}
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

      {audioUrl && !isGenerating && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-gray-800"
          title="Regenerate audio"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}

      <Button
        onClick={onMuteToggle}
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
    </div>
  );
};

