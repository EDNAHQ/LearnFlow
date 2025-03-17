
import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a podcast transcript from the provided content
 */
export async function generatePodcastTranscript(content: string, title?: string, topic?: string) {
  console.log("Calling generate-podcast-transcript edge function with content length:", content.length);
  
  const { data, error: genError } = await supabase.functions.invoke('generate-podcast-transcript', {
    body: { content, title, topic },
  });
  
  console.log("Response from generate-podcast-transcript:", data, genError);
  
  if (genError) {
    throw new Error(`Error generating transcript: ${genError.message}`);
  }
  
  if (data?.transcript) {
    return data.transcript;
  } else {
    throw new Error('No transcript returned from the API');
  }
}

/**
 * Creates a podcast from the provided transcript
 */
export async function createPodcast(transcript: string) {
  console.log("Calling create-podcast edge function with transcript length:", transcript.length);
  
  const { data, error: uploadError } = await supabase.functions.invoke('create-podcast', {
    body: { transcript },
  });

  console.log("Response from create-podcast:", data, uploadError);

  if (uploadError) {
    console.error("Supabase Function Error:", uploadError);
    throw new Error(`Supabase function failed: ${uploadError.message}`);
  }

  if (data && data.jobId) {
    return data.jobId;
  } else {
    throw new Error("Failed to start podcast generation: No job ID received.");
  }
}

/**
 * Checks the status of a podcast generation job
 */
export async function checkPodcastStatus(jobId: string) {
  console.log("Checking podcast status for job ID:", jobId);
  
  const { data, error: statusError } = await supabase.functions.invoke('check-podcast-status', {
    body: { jobId },
  });

  console.log("Response from check-podcast-status:", data, statusError);

  if (statusError) {
    throw new Error(`Error checking status: ${statusError.message}`);
  }

  return data;
}

/**
 * Initiates download of the podcast file
 */
export function downloadPodcastFile(podcastUrl: string) {
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
