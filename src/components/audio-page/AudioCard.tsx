
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioCardContent } from "./AudioCardContent";

interface AudioCardProps {
  audioUrl: string | null;
  isGenerating: boolean;
  isPlaying: boolean;
  error: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  onGenerateAudio: () => void;
  onTogglePlayPause: () => void;
  onGenerateNew: () => void;
}

export const AudioCard: React.FC<AudioCardProps> = ({
  audioUrl,
  isGenerating,
  isPlaying,
  error,
  audioRef,
  onGenerateAudio,
  onTogglePlayPause,
  onGenerateNew,
}) => {
  return (
    <Card className="bg-white shadow-lg max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-brand-purple" />
          Project Overview Audio
        </CardTitle>
        <CardDescription>
          Generate and listen to an audio version of your project summary
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <AudioCardContent
          audioUrl={audioUrl}
          isGenerating={isGenerating}
          isPlaying={isPlaying}
          error={error}
          audioRef={audioRef}
          onGenerateAudio={onGenerateAudio}
          onTogglePlayPause={onTogglePlayPause}
        />
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {audioUrl && (
          <Button
            variant="ghost"
            onClick={onGenerateNew}
            disabled={isGenerating}
          >
            Generate New Summary
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
