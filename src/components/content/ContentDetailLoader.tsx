
import { useState, useEffect, useRef } from "react";
import { generateStepContentWithRetry } from "@/utils/learning/generateStepContentWithRetry";

interface ContentDetailLoaderProps {
  stepId: string;
  title: string;
  content: string;
  topic: string | undefined;
  detailedContent: string | null | undefined;
  onContentLoaded: (content: string) => void;
  onError: (error: string) => void;
}

const LOADER_TIMEOUT_MS = 45000; // 45 second timeout for individual sections

const ContentDetailLoader = ({
  stepId,
  title,
  content,
  topic,
  detailedContent,
  onContentLoaded,
  onError
}: ContentDetailLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef<boolean>(false);
  const previousDetailedContentRef = useRef<string | null | undefined>(detailedContent);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Update loaded content when detailed content prop changes - only once per change
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string' && previousDetailedContentRef.current !== detailedContent) {
      hasLoadedRef.current = true;
      previousDetailedContentRef.current = detailedContent;
      onContentLoaded(detailedContent);
    }
  }, [detailedContent, onContentLoaded]);

  // If no detailed content, try to load it - only once per stepId
  useEffect(() => {
    const loadContent = async () => {
      // Only load if we don't have detailed content, haven't loaded yet, and aren't already loading
      if (!detailedContent && stepId && topic && !isLoading && !hasLoadedRef.current) {
        setIsLoading(true);

        // Set timeout to prevent spinner from spinning forever
        timeoutIdRef.current = setTimeout(() => {
          setIsLoading(false);
          hasLoadedRef.current = true;
          onError("Content generation is taking too long. Please refresh the page and try again.");
        }, LOADER_TIMEOUT_MS);

        try {
          // Extract description from content
          const description = content.includes(':')
            ? content.split(":")[1]?.trim() || ""
            : content;

          const generatedContent = await generateStepContentWithRetry(
            { id: stepId, title, description },
            topic,
            true // Add silent parameter to avoid UI updates
          );

          // Clear timeout if content loaded successfully
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }

          if (typeof generatedContent === 'string' && generatedContent.length > 0) {
            hasLoadedRef.current = true;
            onContentLoaded(generatedContent);
          } else {
            hasLoadedRef.current = true;
            onError("Content could not be loaded properly. Please try refreshing the page.");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";

          // Clear timeout on error
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }

          hasLoadedRef.current = true;

          // Provide more helpful error message based on error type
          if (errorMessage.includes("timed out")) {
            onError("Content generation is taking too long. Please try refreshing the page.");
          } else if (errorMessage.includes("Failed to generate")) {
            onError("Content generation failed. Please try refreshing the page.");
          } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
            onError("Network error while loading content. Please check your connection and try again.");
          } else {
            onError("An error occurred while loading content. Please try refreshing the page.");
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadContent();

    // Cleanup timeout on unmount or when effect re-runs
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [detailedContent, stepId, title, content, topic, isLoading, onContentLoaded, onError]);

  // Reset hasLoadedRef when stepId changes
  useEffect(() => {
    hasLoadedRef.current = false;
    previousDetailedContentRef.current = undefined;
  }, [stepId]);

  return null; // This is a non-visual component
};

export default ContentDetailLoader;
