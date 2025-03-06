
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarLoader } from "@/components/ui/loader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Music, Download, Loader2 } from "lucide-react";

interface PodcastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  title: string;
  topic: string;
}

const PodcastModal = ({ open, onOpenChange, content, title, topic }: PodcastModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const { toast } = useToast();

  // Convert content to a podcast-friendly transcript format
  const generateTranscript = () => {
    // Basic conversion of content to a dialog format
    const paragraphs = content.split("\n\n").filter(p => p.trim() !== "");
    
    let transcript = `Host 1: Today we're discussing ${title} related to ${topic}.\n`;
    transcript += `Host 2: That's right! Let's dive into this fascinating topic.\n\n`;
    
    // Alternate between hosts for each paragraph
    paragraphs.forEach((paragraph, index) => {
      // Skip headers and formatting
      if (paragraph.startsWith("# ") || paragraph.startsWith("## ") || paragraph.startsWith("```")) {
        return;
      }
      
      const host = index % 2 === 0 ? "Host 1" : "Host 2";
      transcript += `${host}: ${paragraph.replace(/\n/g, " ")}\n\n`;
    });
    
    transcript += `Host 1: That concludes our discussion on ${title}.\n`;
    transcript += `Host 2: Thanks for listening, and we hope you learned something new about ${topic}!`;
    
    return transcript;
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

  const handleGeneratePodcast = async () => {
    setIsGenerating(true);
    setError(null);
    setPodcastUrl(null);

    try {
      const transcript = generateTranscript();
      
      const { data, error: uploadError } = await supabase.functions.invoke('create-podcast', {
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
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_podcast.mp3`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Only reset some states to maintain the podcast URL if it was generated
      setIsGenerating(false);
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-brand-purple" />
            Generate Podcast from Content
          </DialogTitle>
          <DialogDescription>
            Convert this content into an AI-generated podcast conversation between two hosts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          {!podcastUrl ? (
            <>
              <p className="text-sm text-gray-500">
                We'll transform your content about <strong>{title}</strong> into a natural-sounding 
                conversation between two hosts. This usually takes about 1-2 minutes.
              </p>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-green-600 font-medium">
                Your podcast has been successfully generated!
              </p>
              
              <audio 
                controls 
                src={podcastUrl} 
                className="w-full rounded-md"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          {!podcastUrl ? (
            <Button 
              onClick={handleGeneratePodcast} 
              disabled={isGenerating}
              className={isGenerating ? "opacity-80" : ""}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  Generate Podcast
                </>
              )}
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={downloadPodcast}
            >
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {podcastUrl ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PodcastModal;
