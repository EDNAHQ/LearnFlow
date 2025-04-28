
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTextToSpeech() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateScript = async (steps: any[], topic: string) => {
    if (!steps || steps.length === 0) {
      const errorMsg = 'No learning steps provided for script generation';
      setError(errorMsg);
      return null;
    }
    
    setIsGeneratingScript(true);
    setError(null);
    
    try {
      console.log(`Generating script for topic: ${topic} with ${steps.length} learning steps`);
      
      // Extract relevant content from steps
      const stepsContent = steps.map(step => ({
        title: step.title,
        content: step.detailed_content || step.content || ''
      }));
      
      // Call the edge function to generate a script
      const response = await supabase.functions.invoke('generate-podcast-transcript', {
        body: { 
          content: JSON.stringify(stepsContent),
          title: `Complete overview of ${topic}`,
          topic: topic,
          isFullProjectSummary: true
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate script');
      }
      
      if (!response.data || !response.data.transcript) {
        throw new Error('No script content received');
      }
      
      const generatedScript = response.data.transcript;
      console.log('Script generated successfully:', generatedScript.substring(0, 100) + '...');
      
      setScriptContent(generatedScript);
      return generatedScript;
    } catch (err: any) {
      console.error('Error generating script:', err);
      const errorMsg = err.message || 'Unknown error occurred during script generation';
      setError(errorMsg);
      toast.error(`Script generation failed: ${errorMsg}`);
      return null;
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateSpeech = async (text: string, voiceId?: string) => {
    if (!text) {
      const errorMsg = 'No text provided for speech generation';
      setError(errorMsg);
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
      const maxLength = 4000;
      const truncatedText = text.length > maxLength 
        ? text.substring(0, maxLength) + "... (content truncated for text to speech)"
        : text;
      
      console.log(`Generating speech for text: ${truncatedText.substring(0, 50)}...`);
      console.log(`Text length: ${truncatedText.length} characters`);
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: truncatedText, 
          voiceId: voiceId || "pFZP5JQG7iQjIQuC4Bku" // Default to Lily voice
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }
      
      if (!response.data) {
        throw new Error('No audio data received');
      }
      
      // Create audio blob from the binary data response
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      
      console.log('Speech generated successfully, audio URL created:', url);
      setAudioUrl(url);
      return url;
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
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setError(null);
    setScriptContent(null);
  };

  return {
    isGenerating,
    isGeneratingScript,
    audioUrl,
    scriptContent,
    error,
    generateSpeech,
    generateScript,
    cleanup
  };
}
