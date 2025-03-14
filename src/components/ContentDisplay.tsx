
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ContentSection from "./ContentSection";
import PresentationView from "./presentation/PresentationView";
import { useContentMode } from "@/hooks/useContentMode";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Music } from "lucide-react";

interface ContentDisplayProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentDisplay = ({ title, content, index, detailedContent, pathId, topic }: ContentDisplayProps) => {
  const { mode } = useContentMode();

  return (
    <div className="w-full max-w-[860px] mx-auto relative">
      <Tabs value={mode} className="w-full">
        <TabsContent value="text" className="px-0 sm:px-4">
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
              content={detailedContent || content.split(":")[1] || ""} 
              title={title}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="podcast">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 w-full max-w-[860px] mx-auto">
            <div className="text-center py-8">
              <Music className="h-16 w-16 mx-auto text-[#6D42EF] opacity-70 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We're enhancing our AI Podcast Creator to deliver a more reliable and feature-rich experience. 
                Check back soon to create engaging podcast conversations between AI hosts.
              </p>
              
              <Alert className="bg-[#6D42EF]/10 border-[#6D42EF] text-left max-w-2xl mx-auto">
                <AlertTitle className="text-[#6D42EF]">Under Development</AlertTitle>
                <AlertDescription className="text-gray-700">
                  Our team is working on integrating improved AI models and audio generation capabilities. 
                  We appreciate your patience as we build something amazing for you!
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentDisplay;
