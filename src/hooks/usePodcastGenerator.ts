
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PodcastGeneratorProps {
  initialTranscript?: string;
  content?: string;
  title?: string;
  topic?: string;
}

export function usePodcastGenerator({
  initialTranscript = '',
  content = '',
  title = '',
  topic = '',
}: PodcastGeneratorProps) {
  const [transcript, setTranscript] = useState('');
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setCharCount(transcript.length);
  }, [transcript]);

  useEffect(() => {
    // If we have content but no transcript, generate the transcript
    if (content && !transcript && !isGeneratingTranscript) {
      generateTranscript();
    }
  }, [content, transcript]);

  const generateTranscript = async () => {
    if (!content || isGeneratingTranscript) return;
    
    setIsGeneratingTranscript(true);
    setError(null);
    
    try {
      toast({
        title: "Generating podcast script...",
        description: "Please wait while we convert your content to podcast format.",
      });
      
      const { data, error: genError } = await supabase.functions.invoke('generate-podcast-transcript', {
        body: { content, title, topic },
      });
      
      if (genError) {
        throw new Error(`Error generating transcript: ${genError.message}`);
      }
      
      if (data?.transcript) {
        setTranscript(data.transcript);
        toast({
          title: "Script ready!",
          description: "Your podcast script has been generated. Review and edit if needed.",
        });
      } else {
        throw new Error('No transcript returned from the API');
      }
    } catch (e: any) {
      setError(`Failed to generate transcript: ${e.message}`);
      toast({
        variant: "destructive",
        title: "Script Generation Failed",
        description: e.message || "There was an error generating your podcast script. Please try again.",
      });
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const checkPodcastStatus = async (initialJobId: string) => {
    try {
      const { data, error: statusError } = await supabase.functions.invoke('check-podcast-status', {
        body: { jobId: initialJobId },
      });

      if (statusError) {
        setError(`Error checking status: ${statusError.message}`);
        setIsGenerating(false);
        return;
      }

      if (data.status === 'COMPLETED') {
        setPodcastUrl(data.podcastUrl);
        setIsGenerating(false);
        toast({
          title: "Podcast Ready!",
          description: "Your AI-generated podcast is ready to listen to.",
        });
      } else if (data.status === 'PROCESSING') {
        setTimeout(() => checkPodcastStatus(initialJobId), 5000); // Poll every 5 seconds
      } else {
        setError(`Podcast generation failed. Status: ${data.status}`);
        setIsGenerating(false);
        setJobId(null);
        toast({
          variant: "destructive",
          title: "Podcast Failed",
          description: "There was an error generating your podcast. Please try again.",
        });
      }
    } catch (e: any) {
      setError(`Failed to check podcast status: ${e.message}`);
      setIsGenerating(false);
      setJobId(null);
      toast({
        variant: "destructive",
        title: "Podcast Failed",
        description: "There was an error generating your podcast. Please try again.",
      });
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    setError(null);
    setPodcastUrl(null);

    try {
      const { data, error: uploadError } = await supabase.functions.invoke('generate-podcast', {
        body: { transcript },
      });

      if (uploadError) {
        console.error("Supabase Function Error:", uploadError);
        setError(`Supabase function failed: ${uploadError.message}`);
        setIsGenerating(false);
        return;
      }

      if (data && data.jobId) {
        setJobId(data.jobId);
        checkPodcastStatus(data.jobId);
      } else {
        setError("Failed to start podcast generation: No job ID received.");
        setIsGenerating(false);
        toast({
          variant: "destructive",
          title: "Podcast Failed",
          description: "There was an error generating your podcast. Please try again.",
        });
      }
    } catch (e: any) {
      setError(`Failed to start podcast generation: ${e.message}`);
      setIsGenerating(false);
      toast({
        variant: "destructive",
        title: "Podcast Failed",
        description: "There was an error generating your podcast. Please try again.",
      });
    }
  };

  const downloadPodcast = () => {
    if (podcastUrl) {
      const link = document.createElement('a');
      link.href = podcastUrl;
      link.download = 'podcast.mp3';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    transcript,
    setTranscript,
    podcastUrl,
    isGenerating,
    isGeneratingTranscript,
    error,
    charCount,
    handleSubmit,
    downloadPodcast
  };
}
