
import { AnimatePresence } from "framer-motion";
import { useContentMode } from "@/hooks/useContentMode";
import ContentSection from "./ContentSection";
import PresentationView from "./presentation/PresentationView";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { useState } from "react";
import PodcastModal from "./podcast/PodcastModal";

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
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);
  
  return (
    <>
      <AnimatePresence mode="wait">
        {mode === "e-book" ? (
          <ContentSection {...props} />
        ) : (
          <PresentationView content={detailedContent || ""} />
        )}
      </AnimatePresence>

      {/* Podcast Modal */}
      <PodcastModal 
        open={isPodcastModalOpen} 
        onOpenChange={setIsPodcastModalOpen}
        content={detailedContent || ""}
        title={title}
        topic={topic || ""}
      />
    </>
  );
};

export default ContentDisplay;
