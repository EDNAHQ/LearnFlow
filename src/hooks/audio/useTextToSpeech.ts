
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_FUNCTIONS } from '@/integrations/supabase/functions';
import { toast } from 'sonner';

export type VoiceProvider = 'elevenlabs' | 'openai';
export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface TextToSpeechOptions {
  provider?: VoiceProvider;
  voice?: string;
  instructions?: string;
}

export function useTextToSpeech() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Add these properties for script generation
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const generateSpeech = async (text: string, pathId: string, options: TextToSpeechOptions = {}) => {
    if (!text) {
      const errorMsg = 'No text provided for speech generation';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }
    
    if (!pathId) {
      const errorMsg = 'No pathId provided for speech generation';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    const provider = options.provider || 'openai'; // Default to OpenAI
    
    try {
      console.log(`Generating speech using ${provider} for path ${pathId} with text length ${text.length}`);
      
      // Determine which endpoint to call based on provider
      const endpoint = provider === 'openai' ? EDGE_FUNCTIONS.textToSpeechOpenAI : EDGE_FUNCTIONS.textToSpeechElevenLabs;
      
      // Call the Supabase Edge Function
      const response = await supabase.functions.invoke(endpoint, {
        body: { 
          text,
          pathId,
          voice: options.voice || (provider === 'openai' ? 'nova' : 'JBFqnCBsd6RMkjVDRZzb'),
          instructions: options.instructions || ''
        }
      });
      
      console.log(`${provider} response:`, response);
      
      if (response.error) {
        throw new Error(response.error.message || `Failed to generate speech with ${provider}`);
      }
      
      if (!response.data?.audioUrl) {
        throw new Error('No audio URL received');
      }
      
      console.log('Generated audio URL:', response.data.audioUrl);
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

  // Script generation function for the AudioSummaryPlayer
  const generateScript = async (steps: any[], topic: string) => {
    setIsGeneratingScript(true);
    setError(null);
    
    try {
      // Generate a summary script from the learning steps
      if (!steps || steps.length === 0) {
        throw new Error('No steps available to generate a script');
      }
      
      // Create a more structured script with better formatting
      const introduction = `Here's a summary of what you'll learn about ${topic}:\n\n`;
      
      // Get content from each step, focusing on the title and first part
      const stepsContent = steps.map((step, index) => {
        const content = step.detailed_content || step.content || '';
        // Extract first paragraph or a portion of the content
        const firstParagraph = content.split('\n')[0] || content.substring(0, 150);
        return `Step ${index + 1}: ${step.title}\n${firstParagraph}\n`;
      }).join('\n\n');
      
      const summary = introduction + stepsContent;
      
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

  const cleanup = useCallback(() => {
    if (audioUrl) {
      setAudioUrl(null);
    }
    setError(null);
    setScriptContent(null);
  }, [audioUrl]);

  return {
    isGenerating,
    audioUrl,
    error,
    generateSpeech,
    cleanup,
    scriptContent,
    isGeneratingScript,
    generateScript
  };
}
