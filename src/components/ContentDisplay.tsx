import { AnimatePresence } from "framer-motion";
import { useContentMode } from "@/hooks/useContentMode";
import ContentSection from "./ContentSection";
import PresentationView from "./presentation/PresentationView";
import PodcastCreator from "./podcast/PodcastCreator";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentDisplayProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentDisplay = (props: ContentDisplayProps) => {
  const { mode, setMode } = useContentMode();
  const { detailedContent, title, topic } = props;
  const [podcastTranscript, setPodcastTranscript] = useState<string | null>(null);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState<boolean>(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setPodcastTranscript(null);
  }, [detailedContent]);

  const generatePodcastTranscript = async () => {
    if (!detailedContent || isGeneratingTranscript) return;
    
    setIsGeneratingTranscript(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-podcast-transcript', {
        body: { 
          content: detailedContent,
          title,
          topic
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.transcript) {
        setPodcastTranscript(data.transcript);
        toast({
          title: "Transcript Generated",
          description: "Your podcast transcript is ready. You can now create your podcast!",
        });
      }
    } catch (error) {
      console.error("Error generating podcast transcript:", error);
      toast({
        variant: "destructive",
        title: "Failed to Generate Transcript",
        description: "There was an error generating your podcast transcript. Please try again.",
      });
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  useEffect(() => {
    const tabValue = mode === "e-book" ? "content" : 
                      mode === "presentation" ? "presentation" : "podcast";
    
    const selectedTab = document.querySelector(`[data-state="active"][data-orientation="horizontal"][role="tab"][value="${tabValue}"]`);
    if (!selectedTab) {
      const tabToClick = document.querySelector(`[role="tab"][value="${tabValue}"]`) as HTMLElement;
      if (tabToClick) {
        tabToClick.click();
      }
    }
  }, [mode]);

  return (
    <Tabs 
      defaultValue={mode === "podcast" ? "podcast" : mode === "presentation" ? "presentation" : "content"} 
      className="w-full"
      onValueChange={(value) => {
        if (value === "content" && mode !== "e-book") {
          setMode("e-book");
        } else if (value === "presentation" && mode !== "presentation") {
          setMode("presentation");
        } else if (value === "podcast" && mode !== "podcast") {
          setMode("podcast");
        }
      }}
    >
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger 
          value="content" 
          className="text-sm"
        >
          Read
        </TabsTrigger>
        <TabsTrigger 
          value="presentation" 
          className="text-sm"
        >
          Present
        </TabsTrigger>
        <TabsTrigger 
          value="podcast" 
          className="flex items-center gap-1.5 text-sm"
        >
          <Music className="h-3.5 w-3.5" />
          <span>Podcast</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-0">
        <AnimatePresence mode="wait">
          <ContentSection {...props} />
        </AnimatePresence>
      </TabsContent>

      <TabsContent value="presentation" className="mt-0">
        <AnimatePresence mode="wait">
          <PresentationView content={detailedContent || ""} />
        </AnimatePresence>
      </TabsContent>

      <TabsContent value="podcast" className="mt-0">
        {!podcastTranscript && !isGeneratingTranscript && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6 text-center border border-gray-100">
            <Music className="h-12 w-12 mx-auto text-brand-purple opacity-60 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Generate Podcast Script</h3>
            <p className="text-gray-600 text-sm mb-4">
              We'll transform this content into a conversational podcast script between two hosts.
            </p>
            <Button 
              onClick={generatePodcastTranscript}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Generate Script
            </Button>
          </div>
        )}
        
        {isGeneratingTranscript && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6 text-center border border-gray-100">
            <div className="animate-pulse flex flex-col items-center">
              <Music className="h-12 w-12 text-brand-purple opacity-60 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Generating Podcast Script...</h3>
              <p className="text-gray-600 text-sm">
                We're creating an engaging podcast script based on this content. This may take a moment.
              </p>
            </div>
          </div>
        )}
        
        {podcastTranscript && (
          <div className="mb-6">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
              <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                {podcastTranscript}
              </pre>
            </div>
            <div className="mt-6">
              <PodcastCreator initialTranscript={podcastTranscript} title={title} topic={topic || ""} />
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ContentDisplay;
