
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AudioErrorProps {
  error: string | null;
  noContent?: boolean;
}

export const AudioError: React.FC<AudioErrorProps> = ({ error, noContent }) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}. Please try again.</AlertDescription>
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

  return null;
};
