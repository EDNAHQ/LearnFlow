
import { useState, useEffect, useRef } from "react";
import { generateStepContentWithRetry } from "@/utils/learning/generateStepContentWithRetry";

interface ContentDetailLoaderProps {
  stepId: string;
  title: string;
  content: string;
  topic: string | undefined;
  detailedContent: string | null | undefined;
  onContentLoaded: (content: string) => void;
}

const ContentDetailLoader = ({ 
  stepId, 
  title, 
  content, 
  topic, 
  detailedContent, 
  onContentLoaded 
}: ContentDetailLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef<boolean>(false);
  const previousDetailedContentRef = useRef<string | null | undefined>(detailedContent);
  
  // Update loaded content when detailed content prop changes - only once per change
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string' && previousDetailedContentRef.current !== detailedContent) {
      console.log("Using provided detailed content");
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
        console.log("Generating content for step:", stepId);
        setIsLoading(true);
        
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
          
          if (typeof generatedContent === 'string' && generatedContent.length > 0) {
            console.log("Content generated successfully");
            hasLoadedRef.current = true;
            onContentLoaded(generatedContent);
          } else {
            console.error("Generated content is invalid:", typeof generatedContent);
            hasLoadedRef.current = true;
            onContentLoaded("Content could not be loaded properly. Please try refreshing the page.");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error loading content:", errorMessage);
          hasLoadedRef.current = true;
          
          // Provide more helpful error message
          if (errorMessage.includes("timed out")) {
            onContentLoaded("Content generation timed out. Please try refreshing the page or contact support if this persists.");
          } else if (errorMessage.includes("Failed to generate")) {
            onContentLoaded("Content generation failed. Please try refreshing the page.");
          } else {
            onContentLoaded("An error occurred while loading content. Please try refreshing the page.");
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadContent();
  }, [detailedContent, stepId, title, content, topic, isLoading, onContentLoaded]);
  
  // Reset hasLoadedRef when stepId changes
  useEffect(() => {
    hasLoadedRef.current = false;
    previousDetailedContentRef.current = undefined;
  }, [stepId]);

  return null; // This is a non-visual component
};

export default ContentDetailLoader;
