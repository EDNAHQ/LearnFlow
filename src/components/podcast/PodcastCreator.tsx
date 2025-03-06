
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlayCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PodcastCreator = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleGeneratePodcast = async () => {
    if (!transcript.trim()) {
      toast.error("Please enter a transcript");
      return;
    }

    if (!transcript.includes("Host 1:") || !transcript.includes("Host 2:")) {
      toast.error("Transcript must include 'Host 1:' and 'Host 2:' markers");
      return;
    }

    setIsGenerating(true);
    setPodcastUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-podcast', {
        body: { transcript },
      });

      if (error) throw error;

      if (data.status === 'PROCESSING') {
        setJobId(data.jobId);
        toast.info("Podcast is still processing. Please check status in a moment.");
      } else if (data.podcastUrl) {
        setPodcastUrl(data.podcastUrl);
        toast.success("Podcast created successfully!");
      }
    } catch (error) {
      console.error("Error generating podcast:", error);
      toast.error("Failed to generate podcast. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const checkStatus = async () => {
    if (!jobId) return;
    
    toast.info("Checking podcast status...");
    
    try {
      // For a production app, you'd create a separate edge function to check status
      // For simplicity, we're reusing the create function with just the jobId
      const { data, error } = await supabase.functions.invoke('check-podcast-status', {
        body: { jobId },
      });

      if (error) throw error;

      if (data.status === 'COMPLETED' && data.podcastUrl) {
        setPodcastUrl(data.podcastUrl);
        toast.success("Podcast is ready!");
      } else {
        toast.info(`Podcast status: ${data.status || 'Still processing'}`);
      }
    } catch (error) {
      console.error("Error checking podcast status:", error);
      toast.error("Failed to check podcast status");
    }
  };

  const copyAudioUrl = () => {
    if (podcastUrl) {
      navigator.clipboard.writeText(podcastUrl);
      toast.success("Audio URL copied to clipboard");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Podcast Creator</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">Podcast Transcript</label>
        <Textarea
          placeholder="Enter your podcast transcript here. Format should include 'Host 1:' and 'Host 2:' markers, for example:
Host 1: Welcome to our podcast!
Host 2: Today we're discussing AI technology.
Host 1: That's right, let's dive in..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={12}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-purple focus:ring-2 focus:border-transparent resize-y"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Button
          onClick={handleGeneratePodcast}
          disabled={isGenerating || !transcript.trim()}
          className="bg-brand-purple hover:bg-brand-purple/90 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Podcast...
            </>
          ) : (
            "Generate Podcast"
          )}
        </Button>

        {jobId && !podcastUrl && (
          <Button 
            onClick={checkStatus} 
            variant="outline"
            className="border-brand-purple text-brand-purple hover:bg-brand-purple/10"
          >
            Check Status
          </Button>
        )}
      </div>

      {podcastUrl && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">Your Podcast is Ready!</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <Button
              as="a"
              href={podcastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Play Audio
            </Button>
            
            <Button 
              onClick={copyAudioUrl} 
              variant="outline"
              className="border-gray-300"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 break-all">
            <span className="font-medium">Audio URL:</span> {podcastUrl}
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>Tips:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Make sure your transcript has clear "Host 1:" and "Host 2:" markers</li>
          <li>Podcast generation may take 30-60 seconds depending on transcript length</li>
          <li>For best results, keep exchanges natural and conversational</li>
        </ul>
      </div>
    </div>
  );
};

export default PodcastCreator;
