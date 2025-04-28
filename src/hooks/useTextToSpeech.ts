
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTextToSpeech() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSpeech = async (text: string, pathId: string) => {
    if (!text) {
      const errorMsg = 'No text provided for speech generation';
      setError(errorMsg);
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // First check if we already have an audio URL for this path
      const { data: pathData } = await supabase
        .from('learning_paths')
        .select('audio_url')
        .eq('id', pathId)
        .single();

      if (pathData?.audio_url) {
        console.log('Using existing audio URL:', pathData.audio_url);
        setAudioUrl(pathData.audio_url);
        return pathData.audio_url;
      }

      // If no existing audio, generate new one
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          pathId
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }
      
      if (!response.data?.audioUrl) {
        throw new Error('No audio URL received');
      }
      
      console.log('Generated new audio URL:', response.data.audioUrl);
      setAudioUrl(response.data.audioUrl);
      toast.success('Audio generated successfully');
      return response.data.audioUrl;
    } catch (err: any) {
      console.error('Error generating speech:', err);
      const errorMsg = err.message || 'Unknown error occurred';
      setError(errorMsg);
      toast.error(`Speech generation failed: ${errorMsg}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const cleanup = () => {
    if (audioUrl) {
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
