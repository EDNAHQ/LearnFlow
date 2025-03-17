
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTextToSpeech() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSpeech = async (text: string, voiceId?: string) => {
    if (!text) {
      setError('No text provided for speech generation');
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Clear previous audio if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      // If text is too long, truncate it
      const truncatedText = text.length > 4000 
        ? text.substring(0, 4000) + "... (content truncated for text to speech)"
        : text;
      
      console.log(`Generating speech for text: ${truncatedText.substring(0, 50)}...`);
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text: truncatedText, voiceId: voiceId || "pFZP5JQG7iQjIQuC4Bku" }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }
      
      if (!response.data) {
        throw new Error('No audio data received');
      }
      
      // Response is a binary audio buffer
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      
      console.log('Speech generated successfully, audio URL created');
      setAudioUrl(url);
      return url;
    } catch (err: any) {
      console.error('Error generating speech:', err);
      setError(err.message || 'Unknown error occurred');
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
    setError(null);
  };

  return {
    isGenerating,
    audioUrl,
    error,
    generateSpeech,
    cleanup
  };
}
