
import { useState } from "react";
import ParagraphNotesMapper from "./ParagraphNotesMapper";
import MarginNotePortals from "./MarginNotePortals";
import { useMarginNotes } from "@/hooks/useMarginNotes";
import { MarginNote } from "@/utils/marginNotesUtils";

interface ContentMarginNotesRendererProps {
  content: string;
  topic: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onNotesGenerated?: () => void; // Add the missing callback prop
}

const ContentMarginNotesRenderer = ({ content, topic, contentRef, onNotesGenerated }: ContentMarginNotesRendererProps) => {
  const { marginNotes } = useMarginNotes(content, topic);
  const [paragraphsWithNotes, setParagraphsWithNotes] = useState<Map<HTMLElement, MarginNote>>(new Map());
  const [renderPortals, setRenderPortals] = useState(false);

  const handleMapComplete = (noteMap: Map<HTMLElement, MarginNote>) => {
    setParagraphsWithNotes(noteMap);
    setRenderPortals(true);
    // Call the onNotesGenerated callback if provided
    if (onNotesGenerated) {
      onNotesGenerated();
    }
  };

  return (
    <>
      <ParagraphNotesMapper 
        contentRef={contentRef} 
        marginNotes={marginNotes}
        onMapComplete={handleMapComplete}
      />
      
      {renderPortals && (
        <MarginNotePortals paragraphsWithNotes={paragraphsWithNotes} />
      )}
    </>
  );
};

export default ContentMarginNotesRenderer;
