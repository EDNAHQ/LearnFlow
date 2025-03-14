
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useContentMode } from "@/hooks/useContentMode";
import TextModeDisplay from "./content/TextModeDisplay";
import SlideModeDisplay from "./content/SlideModeDisplay";
import PodcastModeDisplay from "./content/PodcastModeDisplay";

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

  return (
    <div className="w-full max-w-[860px] mx-auto relative">
      <Tabs value={mode} className="w-full">
        <TabsContent value="text">
          <TextModeDisplay 
            title={title}
            content={content}
            index={index}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
          />
        </TabsContent>
        
        <TabsContent value="slides">
          <SlideModeDisplay 
            title={title}
            content={content}
            detailedContent={detailedContent}
          />
        </TabsContent>
        
        <TabsContent value="podcast">
          <PodcastModeDisplay />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentDisplay;
