
import { useState, useEffect, useRef } from "react";
import { MarginNote, generateMarginNotes } from "@/utils/marginNotesUtils";

export function useMarginNotes(content: string, topic: string) {
  const [marginNotes, setMarginNotes] = useState<MarginNote[]>([]);
  const [loadingMarginNotes, setLoadingMarginNotes] = useState(false);
  const [marginNotesGenerated, setMarginNotesGenerated] = useState(false);
  const isUnmounting = useRef(false);

  // Reset states when content changes
  useEffect(() => {
    console.log("🔍 [useMarginNotes] Content/topic changed, resetting state");
    setMarginNotes([]);
    setMarginNotesGenerated(false);
    isUnmounting.current = false;

    return () => {
      console.log("🔍 [useMarginNotes] Component unmounting");
      isUnmounting.current = true;
    };
  }, [content, topic]);

  // Margin notes are deprecated; keep hook no-op to avoid breaking imports
  const generateContentMarginNotes = async () => {
    console.log("🔍 [useMarginNotes] Checking if should generate:", {
      hasContent: !!content,
      contentLength: content?.length,
      hasTopic: !!topic,
      marginNotesGenerated,
      loadingMarginNotes,
      isUnmounting: isUnmounting.current
    });

    if (!content || !topic || marginNotesGenerated || loadingMarginNotes || isUnmounting.current) {
      console.log("⚠️ [useMarginNotes] Skipping generation due to conditions");
      return;
    }

    setLoadingMarginNotes(false);
    setMarginNotesGenerated(true);
  };

  // Trigger margin notes generation once content is loaded
  useEffect(() => {
    // No-op
  }, [content, topic, marginNotesGenerated, loadingMarginNotes]);

  return { marginNotes, loadingMarginNotes };
}
