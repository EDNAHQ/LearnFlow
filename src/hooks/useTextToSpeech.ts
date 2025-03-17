
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTextToSpeech() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSpeech = async (text: string, voiceId?: string) => {
    if (!text) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Clear previous audio if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      // If text is too long, truncate it
      const truncatedText = text.length > 5000 
        ? text.substring(0, 5000) + "... (content truncated for text to speech)"
        : text;
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: truncatedText, voiceId }
      });
      
      if (error) throw new Error(error.message);
      
      // Create blob from the response data
      const blob = new Blob([data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
      return url;
    } catch (err: any) {
      console.error('Error generating speech:', err);
      setError(`Failed to generate speech: ${err.message}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const cleanup = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  return {
    isGenerating,
    audioUrl,
    error,
    generateSpeech,
    cleanup
  };
}
