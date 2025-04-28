
import React from 'react';

interface AudioErrorDisplayProps {
  error: string | null;
}

export const AudioErrorDisplay: React.FC<AudioErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  // Determine if it's an API key issue
  const isApiKeyError = error.includes("API key") || 
                        error.includes("ELEVEN_LABS_API_KEY") || 
                        error.includes("not configured");
                        
  // Determine if it's a playback issue
  const isPlaybackError = error.includes("play") || 
                          error.includes("playback") || 
                          error.includes("audio element");

  return (
    <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded-md">
      <div className="text-sm font-medium text-red-400 mb-1">
        {isApiKeyError ? "API Key Error" : 
         isPlaybackError ? "Audio Playback Error" : "Error"}
      </div>
      <div className="text-xs text-red-400">
        {error}
        {isApiKeyError && (
          <div className="mt-1">
            The ELEVEN_LABS_API_KEY environment variable is not configured properly.
            Please make sure it's set in your Supabase project settings.
          </div>
        )}
        {isPlaybackError && (
          <div className="mt-1">
            Try refreshing the page or generating the audio again.
          </div>
        )}
      </div>
    </div>
  );
};
