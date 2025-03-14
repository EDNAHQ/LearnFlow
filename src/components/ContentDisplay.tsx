
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

  // Ensure content is a string and extract it properly
  const processContent = (rawContent: any): string => {
    if (typeof rawContent === 'object') {
      return JSON.stringify(rawContent);
    }
    
    if (typeof rawContent !== 'string') {
      return 'No content available';
    }
    
    // Extract actual content if in the format "id: content"
    const colonIndex = rawContent.indexOf(':');
    if (colonIndex > -1) {
      return rawContent.substring(colonIndex + 1).trim();
    }
    
    return rawContent;
  };

  const safeContent = processContent(content);

  return (
    <div className="w-full relative">
      <Tabs value={mode} className="w-full">
        <TabsContent value="text">
          <TextModeDisplay 
            title={title}
            content={safeContent}
            index={index}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
          />
        </TabsContent>
        
        <TabsContent value="slides">
          <SlideModeDisplay 
            title={title}
            content={safeContent}
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
