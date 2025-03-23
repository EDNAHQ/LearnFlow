
import { useEffect, useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import ContentLoader from "./content/ContentLoader";
import ContentDetailLoader from "./content/ContentDetailLoader";
import ContentSectionCore from "./content/ContentSectionCore";
import { useTextSelection } from "@/hooks/useTextSelection";
import "@/styles/content.css";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

// Use memo to prevent unnecessary re-renders
const ContentSection = memo(({ title, content, index, detailedContent, topic }: ContentSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  const { handleTextSelection } = useTextSelection();
  
  // Extract step ID from content if it's in expected format
  const stepId = content.includes(':') ? content.split(":")[0] : '';
  
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
  }, [content, detailedContent, index, topic, loadedDetailedContent]);

  // Initialize with detailed content if available - only do this once per content change
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string' && !contentLoaded) {
      setLoadedDetailedContent(detailedContent);
      setContentLoaded(true);
      console.log("Using provided detailed content");
    }
  }, [detailedContent, contentLoaded]);

  // Handle content detail loading - memoize callback
  const handleContentLoaded = useCallback((loadedContent: string) => {
    if (typeof loadedContent === 'string' && !contentLoaded) {
      console.log("Content loaded successfully", loadedContent.substring(0, 100) + "...");
      setLoadedDetailedContent(loadedContent);
      setContentLoaded(true);
    }
  }, [contentLoaded]);

  // Handle question clicking
  const handleQuestionClick = useCallback((question: string) => {
    // This gets passed down to child components
    // The actual implementation is in ContentInsightsManager
    console.log("Question clicked:", question);
  }, []);

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 mb-8 w-full max-w-5xl mx-auto overflow-hidden",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Only show ContentDetailLoader if content is not already loaded */}
      {!contentLoaded && (
        <ContentDetailLoader
          stepId={stepId}
          title={title}
          content={content}
          topic={topic}
          detailedContent={detailedContent}
          onContentLoaded={handleContentLoaded}
        />
      )}
      
      {!loadedDetailedContent ? (
        <ContentLoader />
      ) : (
        <ContentSectionCore
          loadedDetailedContent={loadedDetailedContent}
          topic={topic}
          title={title}
          stepId={stepId}
          onTextSelection={handleTextSelection}
          onQuestionClick={handleQuestionClick}
        />
      )}
    </div>
  );
});

// Add display name for better debugging
ContentSection.displayName = "ContentSection";

export default ContentSection;
