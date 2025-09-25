
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
          size="sm"
          className={cn(
            "h-8 px-3 text-xs font-medium",
            "text-gray-700 hover:text-brand-primary",
            "hover:bg-brand-primary/10",
            "transition-all duration-200 rounded-lg"
          )}
          title="Regenerate audio"
        >
          Regenerate
        </Button>
      )}

      <Button
        onClick={onMuteToggle}
        variant="ghost"
        size="sm"
        disabled={!audioUrl}
        className={cn(
          "h-8 px-3 text-xs font-medium",
          "text-gray-700 hover:text-brand-primary",
          "hover:bg-brand-primary/10",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "transition-all duration-200 rounded-lg"
        )}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "Unmute" : "Mute"}
      </Button>

      <Button
        onClick={onToggleControls}
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 text-xs font-medium",
          "text-gray-700 hover:text-brand-primary",
          "hover:bg-brand-primary/10",
          "transition-all duration-200 rounded-lg"
        )}
        title={showControls ? "Hide Controls" : "Show Controls"}
      >
        {showControls ? "Hide" : "Show"} Controls
      </Button>
    </div>
  );
};
