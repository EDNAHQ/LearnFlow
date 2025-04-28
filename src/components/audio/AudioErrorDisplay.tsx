
import React from 'react';

interface AudioErrorDisplayProps {
  error: string | null;
}

export const AudioErrorDisplay: React.FC<AudioErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mt-2 text-xs text-red-400">
      Error: {error}. Please try again.
    </div>
  );
};

