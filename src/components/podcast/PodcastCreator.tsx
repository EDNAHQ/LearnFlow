
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarLoader } from '@/components/ui/loader';
import PodcastForm from './PodcastForm';
import PodcastPreview from './PodcastPreview';
import PodcastControls from './PodcastControls';

interface PodcastCreatorProps {
  initialTranscript?: string;
  content?: string;
  title?: string;
  topic?: string;
  pathId?: string;
  stepId?: string;
}

const PodcastCreator = ({ 
  initialTranscript = '', 
  content = '',
  title = '', 
  topic = '',
  pathId = '',
  stepId = ''
}: PodcastCreatorProps) => {
  const [transcript, setTranscript] = useState(content || initialTranscript);
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
          {content 
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
            {isGeneratingTranscript ? (
              <div className="text-center py-8">
                <BarLoader className="mx-auto mb-4" />
                <p>Generating podcast script...</p>
              </div>
            ) : (
              <PodcastForm
                transcript={transcript}
                isGenerating={isGenerating}
                charCount={charCount}
                onTranscriptChange={setTranscript}
              />
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col items-start">
            <PodcastControls
              charCount={charCount}
              isGenerating={isGenerating}
              error={error}
              onSubmit={handleSubmit}
              transcript={transcript}
            />
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="listen" className="mt-4">
          <CardContent>
            {podcastUrl ? (
              <PodcastPreview
                podcastUrl={podcastUrl}
                onDownload={downloadPodcast}
              />
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
