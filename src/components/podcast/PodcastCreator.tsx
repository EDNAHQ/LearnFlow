
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarLoader } from '@/components/ui/loader';
import { supabase } from '@/integrations/supabase/client';
import { Info, MoveRight, CheckCircle, Music, Headphones, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PodcastCreatorProps {
  initialTranscript?: string;
  title?: string;
  topic?: string;
}

const PodcastCreator = ({ initialTranscript = '', title = '', topic = '' }: PodcastCreatorProps) => {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  const examples = `Host 1: Hello and welcome to our podcast!
Host 2: Today we're talking about...
Host 1: That sounds interesting!
Host 2: Let's get started!`;

  useEffect(() => {
    setCharCount(transcript.length);
  }, [transcript]);

  useEffect(() => {
    // Update transcript when initialTranscript prop changes
    if (initialTranscript) {
      setTranscript(initialTranscript);
    }
  }, [initialTranscript]);

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
        })
      }
    } catch (e: any) {
      setError(`Failed to start podcast generation: ${e.message}`);
      setIsGenerating(false);
      toast({
        variant: "destructive",
        title: "Podcast Failed",
        description: "There was an error generating your podcast. Please try again.",
      })
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

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-brand-purple" />
          {title ? `Create Podcast: ${title}` : 'Create Your Podcast'}
        </CardTitle>
        <CardDescription>
          {initialTranscript 
            ? "We've generated a podcast script for you. Edit it if needed, then create your podcast."
            : "Enter your podcast script formatted with \"Host 1:\" and \"Host 2:\" markers"}
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" disabled={isGenerating}>
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Create
            </div>
          </TabsTrigger>
          <TabsTrigger value="listen" disabled={!podcastUrl}>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Listen
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-4">
          <CardContent>
            <div className="space-y-4">
              {examples && (
                <Alert className="bg-gray-50">
                  <Info className="h-4 w-4 text-gray-500" />
                  <AlertTitle>Format Example</AlertTitle>
                  <AlertDescription className="text-xs text-gray-500 mt-2">
                    <pre className="whitespace-pre-wrap font-mono">{examples}</pre>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Host 1: Hello and welcome to our podcast!&#10;Host 2: Today we're talking about..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] resize-y font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start">
            <div className="flex justify-between w-full items-center">
              <div className="text-sm text-gray-500">
                {charCount > 0 && (
                  <span>{charCount} characters</span>
                )}
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={!transcript || isGenerating || charCount < 50}
                className={cn(
                  "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                  (isGenerating || !transcript || charCount < 50) && "opacity-70 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <BarLoader className="w-5 h-5 mr-2" />
                ) : (
                  <MoveRight className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Processing..." : "Create Podcast"}
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4 w-full">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="listen" className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-6">
            {podcastUrl ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-xl font-medium text-center mb-2">Your Podcast is Ready!</h3>
                <p className="text-gray-500 text-center mb-6">
                  Listen to your AI-generated podcast below or download it for later.
                </p>
                
                <audio 
                  controls 
                  src={podcastUrl} 
                  className="w-full max-w-md mb-6 rounded-lg"
                >
                  Your browser does not support the audio element.
                </audio>
                
                <div className="flex gap-3">
                  <a 
                    href={podcastUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Open in New Tab
                  </a>
                  
                  <Button variant="outline" onClick={downloadPodcast}>
                    Download MP3
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <BarLoader className="mx-auto mb-4" />
                <p>Loading your podcast...</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PodcastCreator;
