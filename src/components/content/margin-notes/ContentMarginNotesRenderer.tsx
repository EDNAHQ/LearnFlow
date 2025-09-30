
import { useState, useEffect } from "react";
import ParagraphNotesMapper from "./ParagraphNotesMapper";
import MarginNotePortals from "./MarginNotePortals";
import { useMarginNotes } from "@/hooks/content";
import { MarginNote } from "@/utils/marginNotesUtils";
import { Sparkles } from "lucide-react";

interface ContentMarginNotesRendererProps {
  content: string;
  topic: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onNotesGenerated?: () => void; // Add the missing callback prop
}

const ContentMarginNotesRenderer = ({ content, topic, contentRef, onNotesGenerated }: ContentMarginNotesRendererProps) => {
  const { marginNotes, loadingMarginNotes } = useMarginNotes(content, topic);
  const [paragraphsWithNotes, setParagraphsWithNotes] = useState<Map<HTMLElement, MarginNote>>(new Map());
  const [renderPortals, setRenderPortals] = useState(false);

  useEffect(() => {
    console.log("🔍 [ContentMarginNotesRenderer] State update:", {
      marginNotesCount: marginNotes.length,
      loadingMarginNotes,
      renderPortals,
      mappedCount: paragraphsWithNotes.size
    });
  }, [marginNotes, loadingMarginNotes, renderPortals, paragraphsWithNotes]);

  const handleMapComplete = (noteMap: Map<HTMLElement, MarginNote>) => {
    console.log(`✅ [ContentMarginNotesRenderer] Mapping complete: ${noteMap.size} notes mapped`);
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

      {renderPortals && paragraphsWithNotes.size > 0 && (
        <MarginNotePortals paragraphsWithNotes={paragraphsWithNotes} />
      )}

    </>
  );
};

export default ContentMarginNotesRenderer;
