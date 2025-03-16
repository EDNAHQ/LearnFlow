
import { useState, useEffect, useRef } from "react";
import { MarginNote, generateMarginNotes } from "@/utils/marginNotesUtils";

export function useMarginNotes(content: string, topic: string) {
  const [marginNotes, setMarginNotes] = useState<MarginNote[]>([]);
  const [loadingMarginNotes, setLoadingMarginNotes] = useState(false);
  const [marginNotesGenerated, setMarginNotesGenerated] = useState(false);
  const isUnmounting = useRef(false);

  // Reset states when content changes
  useEffect(() => {
    setMarginNotes([]);
    setMarginNotesGenerated(false);
    isUnmounting.current = false;

    return () => {
      isUnmounting.current = true;
    };
  }, [content, topic]);

  // Generate margin notes once content is loaded
  const generateContentMarginNotes = async () => {
    if (!content || !topic || marginNotesGenerated || loadingMarginNotes || isUnmounting.current) {
      return;
    }
    
    setLoadingMarginNotes(true);
    try {
      console.log(`Generating margin notes for: ${topic}`);
      
      const notes = await generateMarginNotes(content, topic);
      
      if (isUnmounting.current) return;
      
      console.log(`Generated ${notes.length} margin notes for: ${topic}`);
      
      if (notes.length > 0) {
        setMarginNotes(notes);
      } else {
        setMarginNotes([]);
      }
    } catch (error) {
      console.error("Error generating margin notes:", error);
      if (!isUnmounting.current) {
        setMarginNotes([]);
      }
    } finally {
      if (!isUnmounting.current) {
        setLoadingMarginNotes(false);
        setMarginNotesGenerated(true);
      }
    }
  };

  // Trigger margin notes generation once content is loaded
  useEffect(() => {
    if (content && topic) {
      if (!marginNotesGenerated && !loadingMarginNotes && !isUnmounting.current) {
        // Small delay to ensure content is stable before generating notes
        const timer = setTimeout(() => {
          generateContentMarginNotes();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [content, topic, marginNotesGenerated, loadingMarginNotes]);

  return { marginNotes, loadingMarginNotes };
}
