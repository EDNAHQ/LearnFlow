
import { useState, useEffect, useCallback, useRef } from "react";
import { useConceptLinking } from "@/hooks/content";

interface UseContentSectionProps {
  content: string;
  detailedContent?: string | null;
  topic?: string;
}

export function useContentSection({ content, detailedContent, topic }: UseContentSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [focusedConcept, setFocusedConcept] = useState<string | null>(null);
  
  // Extract step ID from content if it's in expected format
  const stepId = content.includes(':') ? content.split(":")[0] : '';
  
  // Get concepts from the loaded content once it's available
  const { concepts, isLoading: conceptsLoading, hasResults, resetExtraction } = useConceptLinking(
    loadedDetailedContent || '',
    topic
  );
  
  // Reset state when content changes
  useEffect(() => {
    setIsVisible(false);
    
    // Only reset content if it has changed significantly
    if (!loadedDetailedContent || content.substring(0, 20) !== loadedDetailedContent.substring(0, 20)) {
      setLoadedDetailedContent(null);
      setContentLoaded(false);
    }
    
    // Animation effect for fading in the content - use a fixed short timeout
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [content, detailedContent, topic, loadedDetailedContent]);

  // Initialize with detailed content if available - only do this once per content change
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string' && !contentLoaded) {
      console.log("Using provided detailed content, length:", detailedContent.length);
      setLoadedDetailedContent(detailedContent);
      setContentLoaded(true);
    }
  }, [detailedContent, contentLoaded]);

  // Handle content detail loading - memoize callback
  const handleContentLoaded = useCallback((loadedContent: string) => {
    if (typeof loadedContent === 'string' && !contentLoaded) {
      console.log("Content loaded successfully, length:", loadedContent.length);
      setLoadedDetailedContent(loadedContent);
      setContentLoaded(true);
      
      // Reset concept extraction when new content is loaded
      resetExtraction();
    }
  }, [contentLoaded, resetExtraction]);

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
