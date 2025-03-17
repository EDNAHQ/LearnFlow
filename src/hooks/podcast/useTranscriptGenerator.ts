
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { generatePodcastTranscript } from '@/utils/podcast/podcastApiUtils';

export function useTranscriptGenerator(initialTranscript = '', content = '', title = '', topic = '') {
  const [transcript, setTranscript] = useState('');
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  // Update character count when transcript changes
  useEffect(() => {
    setCharCount(transcript.length);
  }, [transcript]);

  // Generate transcript if content is provided but no transcript exists
  useEffect(() => {
    if (content && !transcript && !isGeneratingTranscript) {
      generateTranscript();
    }
  }, [content, transcript]);

  // Use initialTranscript if provided
  useEffect(() => {
    if (initialTranscript && !transcript) {
      setTranscript(initialTranscript);
    }
  }, [initialTranscript]);

  const generateTranscript = async () => {
    if (!content || isGeneratingTranscript) return;
    
    setIsGeneratingTranscript(true);
    setError(null);
    
    try {
      const generatedTranscript = await generatePodcastTranscript(content, title, topic);
      setTranscript(generatedTranscript);
    } catch (e: any) {
      const errorMsg = `Failed to generate transcript: ${e.message}`;
      console.error(errorMsg);
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Script Generation Failed",
        description: e.message || "There was an error generating your podcast script. Please try again.",
      });
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  return {
    transcript,
    setTranscript,
    isGeneratingTranscript,
    error,
    setError,
    charCount
  };
}
