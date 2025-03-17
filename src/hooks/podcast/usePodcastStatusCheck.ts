
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { checkPodcastStatus } from '@/utils/podcast/podcastApiUtils';

export function usePodcastStatusCheck() {
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const checkStatus = useCallback(async (initialJobId: string) => {
    try {
      const data = await checkPodcastStatus(initialJobId);

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
        setTimeout(() => checkStatus(initialJobId), 5000);
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
        setTimeout(() => checkStatus(initialJobId), 5000);
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
  }, []);

  const startStatusCheck = useCallback((newJobId: string) => {
    setJobId(newJobId);
    setIsGenerating(true);
    checkStatus(newJobId);
  }, [checkStatus]);

  return {
    podcastUrl,
    isGenerating,
    error,
    jobId,
    startStatusCheck,
    setPodcastUrl,
    setIsGenerating,
    setError
  };
}
