
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

interface AudioErrorProps {
  error: string | null;
  noContent?: boolean;
  attempted?: boolean;
}

export const AudioError: React.FC<AudioErrorProps> = ({ error, noContent, attempted }) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Generating Audio</AlertTitle>
        <AlertDescription>
          {error}.{' '}
          {error.includes("API") && "This might be due to an issue with the AI service connection. "}
          Please try again or check if the API keys are properly configured.
        </AlertDescription>
      </Alert>
    );
  }

  if (noContent) {
    return (
      <Alert className="mt-4 bg-blue-900/20 border-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle>No Content Available</AlertTitle>
        <AlertDescription>
          There's no learning content available for this path yet. Please navigate to a learning path with content.
        </AlertDescription>
      </Alert>
    );
  }

  if (attempted && !error) {
    return (
      <Alert className="mt-4 bg-green-900/20 border-green-800">
        <Info className="h-4 w-4" />
        <AlertTitle>Audio Generation</AlertTitle>
        <AlertDescription>
          If you don't see audio controls or hear audio after generation, there might be an issue with the audio service. Try refreshing the page or generating the audio again.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
