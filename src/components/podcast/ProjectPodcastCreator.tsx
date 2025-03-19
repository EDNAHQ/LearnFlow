
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Headphones } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import PodcastForm from './PodcastForm';
import PodcastPreview from './PodcastPreview';
import PodcastControls from './PodcastControls';
import { useProjectPodcast } from '@/hooks/podcast/useProjectPodcast';

interface ProjectPodcastCreatorProps {
  pathId: string;
  topic: string;
  steps: any[];
}

const ProjectPodcastCreator = ({ 
  pathId,
  topic,
  steps
}: ProjectPodcastCreatorProps) => {
  const {
    transcript,
    setTranscript,
    podcastUrl,
    isGenerating,
    isGeneratingTranscript,
    error,
    charCount,
    handleSubmit,
    downloadPodcast,
    generateProjectTranscript
  } = useProjectPodcast(steps, topic);

  useEffect(() => {
    if (steps.length > 0 && !transcript && !isGeneratingTranscript) {
      generateProjectTranscript();
    }
  }, [steps, transcript, isGeneratingTranscript, generateProjectTranscript]);

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-brand-purple" />
          Create Project Podcast: {topic}
        </CardTitle>
        <CardDescription>
          This podcast summarizes the entire learning project on {topic}.
          {isGeneratingTranscript 
            ? " We're generating a complete podcast script for you..." 
            : " Edit the script if needed, then create your podcast."}
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
                <div className="flex justify-center mb-4">
                  <BarLoader className="mx-auto" />
                </div>
                <p>Generating complete podcast script for {topic}...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a minute as we analyze all content from your learning project.</p>
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
                <div className="flex justify-center mb-4">
                  <BarLoader className="mx-auto" />
                </div>
                <p>Loading your podcast...</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProjectPodcastCreator;
