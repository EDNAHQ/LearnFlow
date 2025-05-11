
import React from "react";
import { AudioGenerationSection } from "./AudioGenerationSection";
import { AudioPlayerSection } from "./AudioPlayerSection";
import { AudioErrorDisplay } from "./AudioErrorDisplay";
import { BarLoader } from "@/components/ui/loader";

interface AudioCardContentProps {
  audioUrl: string | null;
  isGenerating: boolean;
  isPlaying: boolean;
  error: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  onGenerateAudio: () => void;
  onTogglePlayPause: () => void;
}

export const AudioCardContent: React.FC<AudioCardContentProps> = ({
  audioUrl,
  isGenerating,
  isPlaying,
  error,
  audioRef,
  onGenerateAudio,
  onTogglePlayPause,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {!audioUrl ? (
        <AudioGenerationSection 
          isGenerating={isGenerating} 
          onGenerateAudio={onGenerateAudio} 
        />
      ) : (
        <AudioPlayerSection
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          onTogglePlayPause={onTogglePlayPause}
          audioRef={audioRef}
        />
      )}
      
      {isGenerating && <BarLoader className="mt-4" />}
      
      <AudioErrorDisplay error={error} />
    </div>
  );
};
