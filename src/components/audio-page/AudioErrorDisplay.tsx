
import React from "react";

interface AudioErrorDisplayProps {
  error: string | null;
}

export const AudioErrorDisplay: React.FC<AudioErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-md">
      {error}
    </div>
  );
};
