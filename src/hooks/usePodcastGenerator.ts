
import { useState } from 'react';
import { useTranscriptGenerator } from './podcast/useTranscriptGenerator';
import { usePodcastStatusCheck } from './podcast/usePodcastStatusCheck';
import { createPodcast, downloadPodcastFile } from '@/utils/podcast/podcastApiUtils';

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
  // Use the refactored hooks
  const {
    transcript,
    setTranscript,
    isGeneratingTranscript,
    error: transcriptError,
    setError: setTranscriptError,
    charCount
  } = useTranscriptGenerator(initialTranscript, content, title, topic);

  const {
    podcastUrl,
    isGenerating,
    error: podcastError,
    startStatusCheck,
    setError: setPodcastError
  } = usePodcastStatusCheck();

  // Combine errors from both processes
  const error = transcriptError || podcastError;

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

  const downloadPodcast = () => {
    if (podcastUrl) {
      downloadPodcastFile(podcastUrl);
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
