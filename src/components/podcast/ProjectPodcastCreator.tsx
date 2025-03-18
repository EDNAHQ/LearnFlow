
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const [activeTab, setActiveTab] = useState<string>("create");

  // Generate transcript only once when component mounts
  useEffect(() => {
    if (steps.length > 0 && !transcript && !isGeneratingTranscript) {
      generateProjectTranscript();
    }
  }, [steps, transcript, isGeneratingTranscript, generateProjectTranscript]);

  // Automatically switch to listen tab when podcast is ready
  useEffect(() => {
    if (podcastUrl && activeTab === "create") {
      setActiveTab("listen");
    }
  }, [podcastUrl, activeTab]);

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-brand-purple flex items-center justify-center gap-2">
          <Music className="h-6 w-6" />
          Create Project Podcast
        </h1>
        <p className="text-gray-600 mt-2">
          This podcast summarizes your entire learning project on {topic}.
        </p>
      </div>

      <Card className="bg-white shadow-lg border-0 w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {topic}
          </CardTitle>
          <CardDescription>
            {isGeneratingTranscript 
              ? "We're generating a complete podcast script for you..." 
              : "Edit the script if needed, then create your podcast."}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
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
          
          <TabsContent value="create" className="mt-0">
            <CardContent>
              {isGeneratingTranscript ? (
                <div className="text-center py-12 mb-4">
                  <div className="flex justify-center mb-6">
                    <BarLoader className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-brand-purple mb-2">Generating complete podcast script</h3>
                  <p className="text-gray-600">This may take a minute as we analyze all content from your learning project.</p>
                </div>
              ) : (
                <PodcastForm
                  transcript={transcript}
                  isGenerating={isGenerating}
                  charCount={charCount}
                  onTranscriptChange={setTranscript}
                />
              )}
              
              {!isGeneratingTranscript && (
                <div className="mt-6">
                  <PodcastControls
                    charCount={charCount}
                    isGenerating={isGenerating}
                    error={error}
                    onSubmit={handleSubmit}
                    transcript={transcript}
                  />
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="listen" className="mt-0">
            <CardContent>
              {podcastUrl ? (
                <PodcastPreview
                  podcastUrl={podcastUrl}
                  onDownload={downloadPodcast}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-6">
                    <BarLoader className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-brand-purple mb-2">Loading your podcast</h3>
                  <p className="text-gray-600">Just a moment while we prepare your audio...</p>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProjectPodcastCreator;
