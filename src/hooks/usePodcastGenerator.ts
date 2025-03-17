
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

  // If initialTranscript is provided, use it
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
      toast({
        title: "Generating podcast script...",
        description: "Please wait while we convert your content to podcast format.",
      });
      
      console.log("Calling generate-podcast-transcript edge function with content length:", content.length);
      
      const { data, error: genError } = await supabase.functions.invoke('generate-podcast-transcript', {
        body: { content, title, topic },
      });
      
      console.log("Response from generate-podcast-transcript:", data, genError);
      
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

  const checkPodcastStatus = async (initialJobId: string) => {
    try {
      console.log("Checking podcast status for job ID:", initialJobId);
      
      const { data, error: statusError } = await supabase.functions.invoke('check-podcast-status', {
        body: { jobId: initialJobId },
      });

      console.log("Response from check-podcast-status:", data, statusError);

      if (statusError) {
        const errorMsg = `Error checking status: ${statusError.message}`;
        console.error(errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        return;
      }

      // Updated to handle IN_PROGRESS status without treating it as an error
      if (data.status === 'COMPLETED') {
        setPodcastUrl(data.podcastUrl);
        setIsGenerating(false);
        toast({
          title: "Podcast Ready!",
          description: "Your AI-generated podcast is ready to listen to.",
        });
      } else if (data.status === 'PROCESSING' || data.status === 'IN_PROGRESS') {
        // Added IN_PROGRESS as a valid processing state
        console.log(`Podcast still processing. Status: ${data.status}`);
        // Continue polling
        setTimeout(() => checkPodcastStatus(initialJobId), 5000);
      } else if (data.status === 'FAILED') {
        const errorMsg = `Podcast generation failed. Status: ${data.status}`;
        console.error(errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        setJobId(null);
        toast({
          variant: "destructive",
          title: "Podcast Failed",
          description: "There was an error generating your podcast. Please try again.",
        });
      } else {
        console.log(`Unknown podcast status: ${data.status}. Continuing to poll.`);
        // For unknown statuses, continue polling as it might be a temporary state
        setTimeout(() => checkPodcastStatus(initialJobId), 5000);
      }
    } catch (e: any) {
      const errorMsg = `Failed to check podcast status: ${e.message}`;
      console.error(errorMsg);
      setError(errorMsg);
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
      console.log("Calling generate-podcast edge function with transcript length:", transcript.length);
      
      const { data, error: uploadError } = await supabase.functions.invoke('generate-podcast', {
        body: { transcript },
      });

      console.log("Response from generate-podcast:", data, uploadError);

      if (uploadError) {
        console.error("Supabase Function Error:", uploadError);
        setError(`Supabase function failed: ${uploadError.message}`);
        setIsGenerating(false);
        return;
      }

      if (data && data.jobId) {
        setJobId(data.jobId);
        toast({
          title: "Podcast Generation Started",
          description: "Your podcast is being created. This may take a few minutes.",
        });
        checkPodcastStatus(data.jobId);
      } else {
        const errorMsg = "Failed to start podcast generation: No job ID received.";
        console.error(errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        toast({
          variant: "destructive",
          title: "Podcast Failed",
          description: "There was an error generating your podcast. Please try again.",
        });
      }
    } catch (e: any) {
      const errorMsg = `Failed to start podcast generation: ${e.message}`;
      console.error(errorMsg);
      setError(errorMsg);
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
      console.log("Downloading podcast from URL:", podcastUrl);
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
