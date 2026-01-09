
import { useState, useEffect, useCallback, useRef } from "react";

interface UseContentSectionProps {
  content: string;
  detailedContent?: string | null;
  topic?: string;
}

export function useContentSection({ content, detailedContent, topic }: UseContentSectionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use refs to track previous values and prevent infinite loops
  // Initialize refs as undefined to detect first mount
  const previousContentRef = useRef<string | undefined>(undefined);
  const previousDetailedContentRef = useRef<string | null | undefined>(undefined);
  const contentLoadedRef = useRef<boolean>(false);
  
  // Extract step ID from content if it's in expected format
  const stepId = content.includes(':') ? content.split(":")[0] : '';
  
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
        setError(null);
        setRetryCount(0);
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
      setLoadedDetailedContent(detailedContent);
      setContentLoaded(true);
      contentLoadedRef.current = true;
    }
  }, [detailedContent]);

  // Handle content detail loading - use ref to prevent re-creation
  const handleContentLoaded = useCallback((loadedContent: string) => {
    if (typeof loadedContent === 'string' && !contentLoadedRef.current) {
      setLoadedDetailedContent(loadedContent);
      setContentLoaded(true);
      setError(null);
      contentLoadedRef.current = true;
    }
  }, []);

  // Handle content loading errors
  const handleError = useCallback((errorMessage: string) => {
    console.error("Content loading error:", errorMessage);
    setError(errorMessage);
    contentLoadedRef.current = true;
  }, []);

  // Handle retry - resets state to allow reloading
  const handleRetry = useCallback(() => {
    setError(null);
    setContentLoaded(false);
    setLoadedDetailedContent(null);
    contentLoadedRef.current = false;
    setRetryCount(prev => prev + 1);
  }, []);
  
  return {
    isVisible,
    loadedDetailedContent,
    contentLoaded,
    stepId,
    handleContentLoaded,
    handleError,
    handleRetry,
    error,
    retryCount
  };
}
