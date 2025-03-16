
import { createPortal } from 'react-dom';
import ContentMarginNote from "@/components/ContentMarginNote";
import { MarginNote } from "@/utils/marginNotesUtils";

interface MarginNotePortalsProps {
  paragraphsWithNotes: Map<HTMLElement, MarginNote>;
}

const MarginNotePortals = ({ paragraphsWithNotes }: MarginNotePortalsProps) => {
  return (
    <>
      {Array.from(paragraphsWithNotes.entries()).map(([paragraph, note]) => {
        // Find the insight span we created
        const insightSpan = paragraph.querySelector(`.insight-indicator[data-note-id="${note.id}"]`);
        
        // Only render if the span exists in the DOM
        if (insightSpan && document.body.contains(insightSpan)) {
          return createPortal(
            <ContentMarginNote 
              insight={note.insight} 
              key={note.id} 
              className="content-margin-note"
            />,
            insightSpan
          );
        }
        return null;
      })}
    </>
  );
};

export default MarginNotePortals;
