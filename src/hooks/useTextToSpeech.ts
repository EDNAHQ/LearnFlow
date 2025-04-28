
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTextToSpeech() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Add these properties for script generation
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

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

  // Add a script generation function for the AudioSummaryPlayer
  const generateScript = async (steps: any[], topic: string) => {
    setIsGeneratingScript(true);
    setError(null);
    
    try {
      // Generate a summary script from the learning steps
      const content = steps.map(step => step.content || step.detailed_content || '').join('\n\n');
      const summary = `Here's a summary of what you'll learn about ${topic}: ${content.substring(0, 1000)}...`;
      setScriptContent(summary);
      toast.success('Script generated successfully');
      return summary;
    } catch (err: any) {
      console.error('Error generating script:', err);
      const errorMsg = err.message || 'Failed to generate script';
      setError(errorMsg);
      toast.error(`Script generation failed: ${errorMsg}`);
      return null;
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const cleanup = () => {
    if (audioUrl) {
      setAudioUrl(null);
    }
    setError(null);
    setScriptContent(null);
  };

  return {
    isGenerating,
    audioUrl,
    error,
    generateSpeech,
    cleanup,
    // Add the new properties and methods
    scriptContent,
    isGeneratingScript,
    generateScript
  };
}
