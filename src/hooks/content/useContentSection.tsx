
import { useState, useEffect, useCallback, useRef } from "react";
// Concept extraction has been removed from the UI and backend.

interface UseContentSectionProps {
  content: string;
  detailedContent?: string | null;
  topic?: string;
}

export function useContentSection({ content, detailedContent, topic }: UseContentSectionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [focusedConcept, setFocusedConcept] = useState<string | null>(null);
  
  // Use refs to track previous values and prevent infinite loops
  // Initialize refs as undefined to detect first mount
  const previousContentRef = useRef<string | undefined>(undefined);
  const previousDetailedContentRef = useRef<string | null | undefined>(undefined);
  const contentLoadedRef = useRef<boolean>(false);
  
  // Extract step ID from content if it's in expected format
  const stepId = content.includes(':') ? content.split(":")[0] : '';
  
  // Get concepts from the loaded content once it's available
  // Concepts no longer extracted
  const concepts: any[] = [];
  const conceptsLoading = false;
  const resetExtraction = () => {};
  
  // Reset state when content changes - use refs to detect actual changes
  useEffect(() => {
    const isFirstMount = previousContentRef.current === undefined;
    const contentChanged = previousContentRef.current !== content;
    const detailedContentChanged = previousDetailedContentRef.current !== detailedContent;
    
    // On first mount, just initialize refs and keep visible
    if (isFirstMount) {
      previousContentRef.current = content;
      previousDetailedContentRef.current = detailedContent;
      setIsVisible(true);
      return;
    }
    
    // On subsequent changes, animate visibility
    if (contentChanged || detailedContentChanged) {
      setIsVisible(false);
      
      // Only reset content if it has changed significantly
      if (contentChanged) {
        setLoadedDetailedContent(null);
        setContentLoaded(false);
        contentLoadedRef.current = false;
      }
      
      // Update refs
      previousContentRef.current = content;
      previousDetailedContentRef.current = detailedContent;
      
      // Animation effect for fading in the content - use a fixed short timeout
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [content, detailedContent, topic]);

  // Initialize with detailed content if available - only do this once per content change
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string' && !contentLoadedRef.current) {
      console.log("Using provided detailed content, length:", detailedContent.length);
      setLoadedDetailedContent(detailedContent);
      setContentLoaded(true);
      contentLoadedRef.current = true;
    }
  }, [detailedContent]);

  // Handle content detail loading - use ref to prevent re-creation
  const handleContentLoaded = useCallback((loadedContent: string) => {
    if (typeof loadedContent === 'string' && !contentLoadedRef.current) {
      console.log("Content loaded successfully, length:", loadedContent.length);
      setLoadedDetailedContent(loadedContent);
      setContentLoaded(true);
      contentLoadedRef.current = true;
      
      // Reset concept extraction when new content is loaded
      resetExtraction();
    }
  }, []);

  // Handle concept clicking
  const handleConceptClick = useCallback((conceptTerm: string) => {
    console.log("Concept clicked in ContentSection:", conceptTerm);
    setFocusedConcept(conceptTerm);
  }, []);

  // Log when concepts are ready for debugging
  useEffect(() => {
    if (concepts && concepts.length > 0) {
      console.log(`ContentSection has ${concepts.length} concepts ready for ${topic}`);
    }
  }, [concepts, topic]);
  
  return {
    isVisible,
    loadedDetailedContent,
    contentLoaded,
    stepId,
    concepts,
    conceptsLoading,
    handleContentLoaded,
    handleConceptClick,
    focusedConcept
  };
}
