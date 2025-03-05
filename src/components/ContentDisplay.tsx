
import { AnimatePresence } from "framer-motion";
import { useContentMode } from "@/hooks/useContentMode";
import ContentSection from "./ContentSection";
import PresentationView from "./presentation/PresentationView";

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
  const { detailedContent } = props;
  
  return (
    <AnimatePresence mode="wait">
      {mode === "e-book" ? (
        <ContentSection {...props} />
      ) : (
        <PresentationView content={detailedContent || ""} />
      )}
    </AnimatePresence>
  );
};

export default ContentDisplay;
