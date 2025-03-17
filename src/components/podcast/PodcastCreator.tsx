
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Headphones } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import PodcastForm from './PodcastForm';
import PodcastPreview from './PodcastPreview';
import PodcastControls from './PodcastControls';
import { usePodcastGenerator } from '@/hooks/usePodcastGenerator';

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
  const {
    transcript,
    setTranscript,
    podcastUrl,
    isGenerating,
    isGeneratingTranscript,
    error,
    charCount,
    handleSubmit,
    downloadPodcast
  } = usePodcastGenerator({
    initialTranscript,
    content,
    title,
    topic
  });

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
