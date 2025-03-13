
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Presentation, Headphones } from "lucide-react";
import ContentSection from "./ContentSection";
import PresentationView from "./presentation/PresentationView";
import PodcastCreator from "./podcast/PodcastCreator";
import { useContentMode } from "@/hooks/useContentMode";

interface ContentDisplayProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentDisplay = ({ title, content, index, detailedContent, pathId, topic }: ContentDisplayProps) => {
  const { mode, setMode } = useContentMode();

  return (
    <div className="w-full max-w-[860px] mx-auto">
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Text</span>
          </TabsTrigger>
          <TabsTrigger value="slides" className="flex items-center gap-2">
            <Presentation className="w-4 h-4" />
            <span>Slides</span>
          </TabsTrigger>
          <TabsTrigger value="podcast" className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            <span>Podcast</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text">
          <ContentSection 
            title={title}
            content={content}
            index={index}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
          />
        </TabsContent>
        
        <TabsContent value="slides">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full max-w-[860px] mx-auto">
            <PresentationView 
              slides={detailedContent || content.split(":")[1] || ""} 
              title={title}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="podcast">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 w-full max-w-[860px] mx-auto">
            <PodcastCreator 
              contentText={detailedContent || content.split(":")[1] || ""} 
              pathId={pathId || ""}
              stepId={content.split(":")[0] || ""}
              title={title}
              topic={topic || ""}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentDisplay;
