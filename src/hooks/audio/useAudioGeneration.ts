
import { useState } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { toast } from 'sonner';

export const useAudioGeneration = () => {
  const { 
    isGenerating, 
    audioUrl, 
    error: generationError, 
    generateSpeech, 
    cleanup 
  } = useTextToSpeech();

  const [localError, setLocalError] = useState<string | null>(null);

  const generateAudio = async (script: string, pathId: string) => {
    setLocalError(null);
    
    if (!script) {
      const error = "No script content provided for audio generation";
      setLocalError(error);
      toast.error(error);
      return null;
    }

    try {
      console.log("Generating speech from script with length:", script.length);
      const url = await generateSpeech(script, pathId);
      
      if (url) {
        toast.success("Audio generated successfully");
        return url;
      }
      
      return null;
    } catch (err: any) {
      console.error("Failed to generate speech:", err);
      const errorMsg = err.message || "Failed to generate speech";
      setLocalError(errorMsg);
      toast.error(`Failed to generate audio: ${errorMsg}`);
      return null;
    }
  };

  const retryGeneration = async (script: string, pathId: string) => {
    if (!isGenerating && pathId) {
      setLocalError(null);
      cleanup();
      return await generateAudio(script, pathId);
    }
    return null;
  };

  return {
    isGenerating,
    audioUrl,
    error: generationError || localError,
    localError,
    setLocalError,
    generateAudio,
    retryGeneration,
    cleanup
  };
};
