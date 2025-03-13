
import { AnimatePresence } from "framer-motion";
import { useContentMode } from "@/hooks/useContentMode";
import ContentSection from "./ContentSection";
import PresentationView from "./presentation/PresentationView";
import PodcastCreator from "./podcast/PodcastCreator";
import { useState } from "react";
import { Music } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContentDisplayProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentDisplay = (props: ContentDisplayProps) => {
  const { mode } = useContentMode();
  const { detailedContent, title, topic } = props;
  const [podcastTranscript, setPodcastTranscript] = useState<string | null>(null);
  
  if (mode === "e-book") {
    return (
      <AnimatePresence mode="wait">
        <div className="max-w-[860px] mx-auto w-full">
          <ContentSection {...props} />
        </div>
      </AnimatePresence>
    );
  }

  if (mode === "presentation") {
    return (
      <AnimatePresence mode="wait">
        <div className="max-w-[860px] mx-auto w-full">
          <PresentationView content={detailedContent || ""} />
        </div>
      </AnimatePresence>
    );
  }

  if (mode === "podcast") {
    return (
      <div className="mb-6 w-full max-w-[860px] mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6 text-center border border-gray-100 w-full">
          <Music className="h-12 w-12 mx-auto text-brand-purple opacity-60 mb-3" />
          <h3 className="font-semibold text-lg mb-2">Podcast Feature Coming Soon!</h3>
          <p className="text-gray-600 text-sm mb-4">
            We're working on enhancing our podcast generation feature. 
            Check back soon for an improved experience!
          </p>
          <Alert className="bg-brand-purple/10 border-brand-purple text-left">
            <AlertTitle className="text-brand-purple">Under Development</AlertTitle>
            <AlertDescription className="text-gray-700">
              Our team is currently improving the podcast generation functionality to make it more reliable and feature-rich.
            </AlertDescription>
          </Alert>
        </div>
        
        {podcastTranscript && (
          <div className="mt-6 w-full">
            <PodcastCreator initialTranscript={podcastTranscript} title={title} topic={topic || ""} />
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ContentDisplay;
