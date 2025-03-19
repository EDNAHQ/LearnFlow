
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePodcastStatusCheck } from './usePodcastStatusCheck';
import { createPodcast, downloadPodcastFile } from '@/utils/podcast/podcastApiUtils';

export function useProjectPodcast(steps: any[], topic: string) {
  const [transcript, setTranscript] = useState<string>('');
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const {
    podcastUrl,
    isGenerating,
    error: podcastError,
    startStatusCheck,
    setError: setPodcastError
  } = usePodcastStatusCheck();

  // Update character count when transcript changes
  useEffect(() => {
    setCharCount(transcript.length);
  }, [transcript]);

  // Generate a transcript from all steps in the project
  const generateProjectTranscript = async () => {
    if (steps.length === 0 || isGeneratingTranscript) return;
    
    setIsGeneratingTranscript(true);
    setError(null);
    
    try {
      console.log(`Generating project transcript for topic: ${topic} with ${steps.length} steps`);
      
      // Extract content from all steps
      const stepsContent = steps.map(step => ({
        title: step.title,
        content: step.detailed_content || step.content || ''
      }));
      
      // Call the edge function to generate a transcript for the entire project
      const { data, error: genError } = await supabase.functions.invoke('generate-podcast-transcript', {
        body: { 
          content: JSON.stringify(stepsContent),
          title: `Complete ${topic} Learning Project`,
          topic,
          isFullProjectSummary: true
        }
      });
      
      if (genError) {
        throw new Error(`Error generating transcript: ${genError.message}`);
      }
      
      if (data?.transcript) {
        console.log("Project transcript generated successfully");
        setTranscript(data.transcript);
      } else {
        throw new Error('No transcript returned from the API');
      }
    } catch (e: any) {
      const errorMsg = `Failed to generate project transcript: ${e.message}`;
      console.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  // Handle podcast creation
  const handleSubmit = async () => {
    setPodcastError(null);
    
    try {
      const jobId = await createPodcast(transcript);
      startStatusCheck(jobId);
    } catch (e: any) {
      const errorMsg = `Failed to start podcast generation: ${e.message}`;
      console.error(errorMsg);
      setPodcastError(errorMsg);
    }
  };

  // Handle podcast download
  const downloadPodcast = () => {
    if (podcastUrl) {
      downloadPodcastFile(podcastUrl);
    }
  };

  // Combine errors from both processes
  const combinedError = error || podcastError;

  return {
    transcript,
    setTranscript,
    podcastUrl,
    isGenerating,
    isGeneratingTranscript,
    error: combinedError,
    charCount,
    handleSubmit,
    downloadPodcast,
    generateProjectTranscript
  };
}
