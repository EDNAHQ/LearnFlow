
import { useState, useEffect, useRef } from "react";
import { MarginNote } from "@/utils/marginNotesUtils";

interface ParagraphNotesMapperProps {
  contentRef: React.RefObject<HTMLDivElement>;
  marginNotes: MarginNote[];
  onMapComplete: (paragraphMap: Map<HTMLElement, MarginNote>) => void;
}

const ParagraphNotesMapper = ({ contentRef, marginNotes, onMapComplete }: ParagraphNotesMapperProps) => {
  const isUnmounting = useRef(false);
  const mappingComplete = useRef(false);
  const [hasStartedMapping, setHasStartedMapping] = useState(false);
  
  useEffect(() => {
    return () => {
      isUnmounting.current = true;
    };
  }, []);

  // Reset mapping state when notes change
  useEffect(() => {
    console.log("🔄 [ParagraphNotesMapper] Resetting mapping state due to notes change");
    mappingComplete.current = false;
    setHasStartedMapping(false);
  }, [marginNotes.length]); // Use length instead of array reference

  // Find paragraphs for notes and prepare for portal rendering
  useEffect(() => {
    console.log("🔍 [ParagraphNotesMapper] Effect triggered:", {
      mappingComplete: mappingComplete.current,
      hasStartedMapping,
      hasContentRef: !!contentRef.current,
      notesCount: marginNotes.length,
      isUnmounting: isUnmounting.current
    });

    // Skip if already mapped, already started mapping, content ref is missing, or no margin notes
    if (mappingComplete.current || hasStartedMapping || !contentRef.current || marginNotes.length === 0 || isUnmounting.current) {
      console.log("⚠️ [ParagraphNotesMapper] Skipping mapping");
      return;
    }

    // Set flag to prevent multiple concurrent mapping attempts
    setHasStartedMapping(true);
    console.log("⏰ [ParagraphNotesMapper] Starting mapping in 500ms");

    const timer = setTimeout(() => {
      if (isUnmounting.current || !contentRef.current) {
        console.log("⚠️ [ParagraphNotesMapper] Unmounted or no content ref, aborting");
        return;
      }

      const contentDiv = contentRef.current;
      // Find all paragraphs in the content
      const paragraphs = contentDiv.querySelectorAll('p');
      console.log(`🔍 [ParagraphNotesMapper] Found ${paragraphs.length} <p> elements in content`);

      if (paragraphs.length === 0) {
        console.log("⚠️ [ParagraphNotesMapper] No paragraphs found, checking content structure");
        console.log("Content HTML preview:", contentDiv.innerHTML.substring(0, 200));
        return;
      }

      const newParagraphsWithNotes = new Map<HTMLElement, MarginNote>();

      // For each margin note, find a matching paragraph
      marginNotes.forEach((note, index) => {
        if (isUnmounting.current) return;

        const paragraphFragment = note.paragraph.substring(0, 50).toLowerCase();
        console.log(`🔍 [ParagraphNotesMapper] Looking for note ${index + 1}: "${paragraphFragment}..."`);

        let found = false;
        // Try to find a paragraph containing this fragment
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i];
          const paragraphText = paragraph.textContent?.toLowerCase() || '';

          // Skip if this paragraph already has a note
          if (paragraph.classList.contains('has-margin-note')) {
            continue;
          }

          if (paragraphText.includes(paragraphFragment)) {
            console.log(`✅ [ParagraphNotesMapper] Matched note ${index + 1} to paragraph ${i + 1}`);
            // Add the paragraph and note to our Map
            newParagraphsWithNotes.set(paragraph, note);

            // Add class to paragraph directly
            paragraph.classList.add('has-margin-note');

            // Create a span to hold the portal only if it doesn't exist yet
            if (!paragraph.querySelector(`.insight-indicator[data-note-id="${note.id}"]`)) {
              const insightSpan = document.createElement('span');
              insightSpan.className = 'insight-indicator';
              insightSpan.setAttribute('data-note-id', note.id);
              paragraph.appendChild(insightSpan);
            }

            found = true;
            break;
          }
        }

        if (!found) {
          console.log(`❌ [ParagraphNotesMapper] Could not find match for note ${index + 1}`);
          console.log("Note paragraph preview:", note.paragraph.substring(0, 100));
        }
      });

      console.log(`🏁 [ParagraphNotesMapper] Mapping complete: ${newParagraphsWithNotes.size} notes mapped out of ${marginNotes.length}`);

      // Mark mapping as complete to prevent multiple mappings
      mappingComplete.current = true;
      onMapComplete(newParagraphsWithNotes);

    }, 500);

    return () => clearTimeout(timer);
  }, [marginNotes, contentRef, onMapComplete, hasStartedMapping]);

  return null;
};

export default ParagraphNotesMapper;
