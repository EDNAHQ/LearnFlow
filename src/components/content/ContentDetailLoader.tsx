
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
    if (detailedContent) {
      onContentLoaded(detailedContent);
    }
  }, [detailedContent, onContentLoaded]);

  // If no detailed content, try to load it directly
  useEffect(() => {
    if (!detailedContent && stepId && topic && !isLoading) {
      const loadContent = async () => {
        setIsLoading(true);
        try {
          const description = content.split(":")[1] || "";
          const generatedContent = await generateStepContent(
            { id: stepId, title, description },
            topic
          );
          onContentLoaded(generatedContent);
        } catch (error) {
          console.error("Error loading content:", error);
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
