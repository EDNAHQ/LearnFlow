
import { useState, useEffect } from "react";
import { generateStepContent } from "@/utils/learningUtils";
import { toast } from "sonner";

interface ContentDetailLoaderProps {
  stepId: string;
  title: string;
  content: string;
  topic: string | undefined;
  detailedContent: string | null | undefined;
  onContentLoaded: (content: string) => void;
  isFirstStep?: boolean;
}

const ContentDetailLoader = ({ 
  stepId, 
  title, 
  content, 
  topic, 
  detailedContent, 
  onContentLoaded,
  isFirstStep = false
}: ContentDetailLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Update loaded content when detailed content prop changes
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string') {
      console.log("Using provided detailed content");
      onContentLoaded(detailedContent);
    }
  }, [detailedContent, onContentLoaded]);

  // If no detailed content, try to load it
  useEffect(() => {
    const loadContent = async () => {
      // Only load if we don't have detailed content, have required data, aren't already loading,
      // and haven't attempted to load before
      if (!detailedContent && stepId && topic && !isLoading && !hasAttemptedLoad) {
        console.log(`Generating content for step: ${stepId} (isFirstStep: ${isFirstStep})`);
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        try {
          // Extract description from content
          const description = content.includes(':') 
            ? content.split(":")[1]?.trim() || ""
            : content;
            
          const generatedContent = await generateStepContent(
            { id: stepId, title, description },
            topic,
            !isFirstStep // Only use silent mode for non-first steps
          );
          
          if (typeof generatedContent === 'string') {
            console.log("Content generated successfully");
            onContentLoaded(generatedContent);
            
            if (isFirstStep) {
              toast.success("First step is ready! The rest will continue generating in the background.", {
                id: "first-step-ready",
                duration: 3000
              });
            }
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
      }
    };
    
    loadContent();
  }, [detailedContent, stepId, title, content, topic, isLoading, hasAttemptedLoad, onContentLoaded, isFirstStep]);

  return null; // This is a non-visual component
};

export default ContentDetailLoader;
