
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useContentMode } from "@/hooks/useContentMode";
import TextModeDisplay from "./content/TextModeDisplay";
import SlideModeDisplay from "./content/SlideModeDisplay";
import PodcastCreator from "./podcast/PodcastCreator";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Button } from "@/components/ui/button";
import { Headphones, Loader2, Play, Pause } from "lucide-react";

interface ContentDisplayProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentDisplay = ({ 
  title, 
  content, 
  index, 
  detailedContent, 
  pathId, 
  topic 
}: ContentDisplayProps) => {
  const { mode } = useContentMode();
  const { generateSpeech, isGenerating, audioUrl, cleanup } = useTextToSpeech();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Transform content to ensure it's a string
  const safeContent = typeof content === 'string' 
    ? content 
    : (content ? JSON.stringify(content) : "No content available");
  
  // Similar handling for detailed content
  const safeDetailedContent = typeof detailedContent === 'string'
    ? detailedContent
    : (detailedContent ? JSON.stringify(detailedContent) : null);

  const handleGenerateAudio = async () => {
    const textToConvert = safeDetailedContent || safeContent;
    await generateSpeech(textToConvert);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Failed to play audio:", err);
        });
      }
    }
  };

  // Handle audio events
  React.useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      cleanup();
    };
  }, [audioUrl, cleanup]);

  return (
    <div className="w-full relative">
      <Tabs value={mode} className="w-full">
        <TabsContent value="text">
          <TextModeDisplay 
            title={title}
            content={safeContent}
            index={index}
            detailedContent={safeDetailedContent}
            pathId={pathId}
            topic={topic}
          />
        </TabsContent>
        
        <TabsContent value="slides">
          <SlideModeDisplay 
            title={title}
            content={safeContent}
            detailedContent={safeDetailedContent}
          />
        </TabsContent>
        
        <TabsContent value="podcast">
          <PodcastCreator 
            title={title}
            content={safeContent}
            topic={topic}
            pathId={pathId}
            stepId={index.toString()}
          />
        </TabsContent>

        <TabsContent value="audio">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold mb-4">{title} - Audio Version</h2>
              
              {!audioUrl ? (
                <div className="flex flex-col items-center py-6">
                  <Headphones className="h-16 w-16 text-brand-purple mb-4" />
                  <p className="text-center mb-4">
                    Generate audio for this content to listen on the go
                  </p>
                  <Button 
                    onClick={handleGenerateAudio}
                    disabled={isGenerating}
                    className="bg-brand-purple hover:bg-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Audio...
                      </>
                    ) : (
                      <>Generate Audio</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button 
                      onClick={togglePlayPause}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full border-brand-purple"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 text-brand-purple" />
                      ) : (
                        <Play className="h-6 w-6 ml-1 text-brand-purple" />
                      )}
                    </Button>
                    
                    <div className="text-lg font-medium">
                      {isPlaying ? "Playing..." : "Ready to play"}
                    </div>
                  </div>
                  
                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    controls 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentDisplay;
