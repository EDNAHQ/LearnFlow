
import { useState, useEffect, useCallback } from 'react';
import { checkPodcastStatus } from '@/utils/podcast/podcastApiUtils';

export function usePodcastStatusCheck() {
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const checkStatus = useCallback(async (initialJobId: string) => {
    try {
      const data = await checkPodcastStatus(initialJobId);

      if (data.status === 'COMPLETED') {
        setPodcastUrl(data.podcastUrl);
        setIsGenerating(false);
      } else if (data.status === 'PROCESSING' || data.status === 'IN_PROGRESS') {
        console.log(`Podcast still processing. Status: ${data.status}`);
        // Continue polling
        setTimeout(() => checkStatus(initialJobId), 5000);
      } else if (data.status === 'FAILED') {
        const errorMsg = `Podcast generation failed. Status: ${data.status}`;
        console.error(errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        setJobId(null);
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
