
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
    // Check for specific API key related errors
    const isApiKeyError = error.includes("API key") || 
                          error.includes("ELEVEN_LABS_API_KEY") || 
                          error.includes("not configured") ||
                          error.includes("authentication failed");
    
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Generating Audio</AlertTitle>
        <AlertDescription>
          {error}
          {isApiKeyError && (
            <span className="block mt-2">
              This is an API key configuration issue with ElevenLabs. Please make sure the ELEVEN_LABS_API_KEY 
              is properly configured in your Supabase project settings.
            </span>
          )}
          {!isApiKeyError && error.includes("API") && (
            <span className="block mt-2">
              This might be due to an issue with the ElevenLabs API service connection.
              Please try again or check if the API keys are properly configured.
            </span>
          )}
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
