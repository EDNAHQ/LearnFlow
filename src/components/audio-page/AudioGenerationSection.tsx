
import React from "react";
import { Button } from "@/components/ui/button";
import { Headphones, Loader2 } from "lucide-react";

interface AudioGenerationSectionProps {
  isGenerating: boolean;
  onGenerateAudio: () => void;
}

export const AudioGenerationSection: React.FC<AudioGenerationSectionProps> = ({
  isGenerating,
  onGenerateAudio,
}) => {
  return (
    <div className="flex flex-col items-center py-8">
      <Headphones className="h-16 w-16 text-brand-purple mb-4" />
      <p className="text-center mb-4">
        Generate an audio summary of your project to listen on the go
      </p>
      <Button 
        onClick={onGenerateAudio}
        disabled={isGenerating}
        className="bg-brand-purple hover:bg-purple-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Audio...
          </>
        ) : (
          <>Generate Audio Summary</>
        )}
      </Button>
    </div>
  );
};
