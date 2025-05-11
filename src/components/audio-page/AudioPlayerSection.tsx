
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface AudioPlayerSectionProps {
  audioUrl: string;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioPlayerSection: React.FC<AudioPlayerSectionProps> = ({
  audioUrl,
  isPlaying,
  onTogglePlayPause,
  audioRef,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button 
          onClick={onTogglePlayPause}
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-brand-purple"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-brand-purple" />
          ) : (
            <Play className="h-6 w-6 ml-1 text-brand-purple" />
          )}
        </Button>
        
        <div className="text-lg font-medium">
          {isPlaying ? "Playing..." : "Ready to play"}
        </div>
      </div>
      
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        controls 
        className="w-full"
      />
    </div>
  );
};
