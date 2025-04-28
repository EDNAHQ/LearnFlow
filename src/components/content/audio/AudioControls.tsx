
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Loader2, VolumeX, RefreshCw } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  showControls: boolean;
  isGenerating: boolean;
  audioUrl: string | null;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onRetry: () => void;
  onToggleControls: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isMuted,
  showControls,
  isGenerating,
  audioUrl,
  onPlayPause,
  onMuteToggle,
  onRetry,
  onToggleControls,
}) => {
  return (
    <div className="flex items-center gap-2">
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
      
      <Button
        onClick={onToggleControls}
        variant="ghost"
        size="sm"
        className="text-xs text-gray-400 hover:bg-gray-800"
      >
        {showControls ? "Hide Controls" : "Show Controls"}
      </Button>
    </div>
  );
};
