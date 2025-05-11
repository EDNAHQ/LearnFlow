
import React from 'react';

interface AudioErrorDisplayProps {
  error: string | null;
}

export const AudioErrorDisplay: React.FC<AudioErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  // Determine if it's an API key issue
  const isApiKeyError = error.includes("API key") || 
                        error.includes("ELEVEN_LABS_API_KEY") || 
                        error.includes("not configured") ||
                        error.includes("authentication failed");
                        
  // Determine if it's a playback issue
  const isPlaybackError = error.includes("play") || 
                          error.includes("playback") || 
                          error.includes("audio element") ||
                          error.includes("Unknown error") ||
                          error.includes("Network error");
                          
  // Determine if it's a format/decode issue
  const isFormatError = error.includes("decoding") ||
                        error.includes("format") ||
                        error.includes("supported") ||
                        error.includes("MEDIA_ERR");

  // Suggestions based on error type
  let troubleshootingSuggestions = "";
  
  if (isApiKeyError) {
    troubleshootingSuggestions = "The ELEVEN_LABS_API_KEY environment variable is not configured properly. " +
      "Please make sure it's set in your Supabase project settings.";
  } else if (isPlaybackError) {
    troubleshootingSuggestions = "Try refreshing the page, clearing your browser cache, or using a different browser. " +
      "If the issue persists, regenerate the audio by clicking the retry button.";
  } else if (isFormatError) {
    troubleshootingSuggestions = "Your browser might not support this audio format. " +
      "Try using a different browser or regenerating the audio.";
  }

  return (
    <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded-md">
      <div className="text-sm font-medium text-red-400 mb-1">
        {isApiKeyError ? "API Key Error" : 
         isPlaybackError ? "Audio Playback Error" : 
         isFormatError ? "Audio Format Error" : "Error"}
      </div>
      <div className="text-xs text-red-400">
        {error}
        {troubleshootingSuggestions && (
          <div className="mt-1">
            {troubleshootingSuggestions}
          </div>
        )}
      </div>
    </div>
  );
};
