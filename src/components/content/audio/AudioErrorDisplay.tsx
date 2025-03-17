
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AudioErrorDisplayProps {
  error: string | null;
  stepsLength: number;
}

const AudioErrorDisplay: React.FC<AudioErrorDisplayProps> = ({ error, stepsLength }) => {
  return (
    <>
      {/* Error message display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Info message when no steps */}
      {stepsLength === 0 && (
        <Alert className="mt-4 bg-blue-900/20 border-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle>No Content Available</AlertTitle>
          <AlertDescription>
            There's no learning content available for this path yet. Please navigate to a learning path with content.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AudioErrorDisplay;
