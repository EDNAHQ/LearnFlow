
import React from 'react';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarLoader } from '@/components/ui/loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, Info, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PodcastControlsProps {
  charCount: number;
  isGenerating: boolean;
  error: string | null;
  onSubmit: () => void;
  transcript: string;
}

const PodcastControls = ({
  charCount,
  isGenerating,
  error,
  onSubmit,
  transcript
}: PodcastControlsProps) => {
  return (
    <div className="w-full">
      <div className="flex justify-between w-full items-center mb-4">
        <div className="text-sm text-gray-500">
          {charCount > 0 && (
            <span>{charCount} characters</span>
          )}
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={!transcript || isGenerating || charCount < 50}
          className={cn(
            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2",
            (isGenerating || !transcript || charCount < 50) && "opacity-70 cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <>
              <BarLoader className="w-5 h-5 mr-2" />
              Creating Podcast...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Create Podcast
            </>
          )}
        </Button>
      </div>
      
      {isGenerating && (
        <Alert className="mt-4 w-full bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-500" />
          <AlertTitle className="text-purple-700">Podcast Generation in Progress</AlertTitle>
          <AlertDescription className="text-purple-600">
            This may take several minutes. The page will automatically update when your podcast is ready. You can switch to other tabs while waiting.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-4 w-full">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PodcastControls;
