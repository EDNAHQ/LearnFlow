
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
  const isFirstStep = index === 0;

  // Transform content to ensure it's a string
  const safeContent = typeof content === 'string' 
    ? content 
    : (content ? JSON.stringify(content) : "No content available");
  
  // Similar handling for detailed content
  const safeDetailedContent = typeof detailedContent === 'string'
    ? detailedContent
    : (detailedContent ? JSON.stringify(detailedContent) : null);

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
            isFirstStep={isFirstStep}
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
          <PodcastModeDisplay />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentDisplay;
