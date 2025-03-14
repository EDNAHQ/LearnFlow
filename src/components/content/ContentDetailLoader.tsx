
import { useState, useEffect } from "react";
import { generateStepContent } from "@/utils/learningUtils";

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
  
  // Update loaded content when detailed content prop changes
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string') {
      onContentLoaded(detailedContent);
    }
  }, [detailedContent, onContentLoaded]);

  // If no detailed content, try to load it directly
  useEffect(() => {
    // Make sure we have valid inputs and we're not already loading
    if (!detailedContent && stepId && topic && !isLoading) {
      const loadContent = async () => {
        setIsLoading(true);
        try {
          // Extract description from content if in the expected format
          const description = typeof content === 'string' && content.includes(':') 
            ? content.split(":")[1]?.trim() || "" 
            : String(content || "");
            
          const generatedContent = await generateStepContent(
            { id: stepId, title, description },
            topic
          );
          
          if (typeof generatedContent === 'string') {
            onContentLoaded(generatedContent);
          } else {
            console.error("Generated content is not a string:", generatedContent);
            onContentLoaded("Content could not be loaded properly. Please try refreshing the page.");
          }
        } catch (error) {
          console.error("Error loading content:", error);
          onContentLoaded("An error occurred while loading content. Please try refreshing the page.");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadContent();
    }
  }, [detailedContent, stepId, title, content, topic, isLoading, onContentLoaded]);

  return null; // This is a non-visual component
};

export default ContentDetailLoader;
