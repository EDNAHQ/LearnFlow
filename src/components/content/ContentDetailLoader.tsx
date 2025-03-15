
import { useState, useEffect } from "react";
import { generateStepContent } from "@/utils/learning";
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  
  // Update loaded content when detailed content prop changes
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string') {
      console.log(`Using provided detailed content for step: ${stepId}`);
      onContentLoaded(detailedContent);
    }
  }, [detailedContent, onContentLoaded, stepId]);

  // If no detailed content, try to load it
  useEffect(() => {
    const loadContent = async () => {
      // Only load if we don't have detailed content, have required data, aren't already loading,
      // and haven't exceeded retry attempts
      if (!detailedContent && stepId && topic && !isLoading && retryCount < MAX_RETRIES) {
        console.log(`Generating content for step: ${stepId} (isFirstStep: ${isFirstStep}, attempt: ${retryCount + 1}/${MAX_RETRIES})`);
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        try {
          // Extract description from content
          const stepDescription = content.includes(':') 
            ? content.split(":")[1]?.trim() || ""
            : content;
            
          const generatedContent = await generateStepContent(
            { id: stepId, title, description: stepDescription },
            topic,
            !isFirstStep // Only use silent mode for non-first steps
          );
          
          if (typeof generatedContent === 'string' && generatedContent.length > 50) {
            console.log(`Content generated successfully for step: ${stepId} (${generatedContent.length} chars)`);
            onContentLoaded(generatedContent);
            
            if (isFirstStep) {
              toast.success("First step is ready! The rest will continue generating in the background.", {
                id: "first-step-ready",
                duration: 3000
              });
            }
          } else {
            console.error(`Generated content is invalid for step ${stepId}:`, generatedContent);
            setRetryCount(prev => prev + 1);
            
            // If this is the last retry, provide a fallback
            if (retryCount + 1 >= MAX_RETRIES) {
              const fallbackContent = `# ${title}\n\nWe're experiencing some technical difficulties generating the detailed content for this step. Please try refreshing the page or check back later.\n\n**Key Points to Know:**\n\n- This section covers ${title}\n- ${stepDescription}\n\nOur team is working to resolve this issue as quickly as possible.`;
              onContentLoaded(fallbackContent);
              console.log(`Using fallback content for step: ${stepId} after ${MAX_RETRIES} failed attempts`);
            }
          }
        } catch (error) {
          console.error(`Error loading content for step ${stepId}:`, error);
          setRetryCount(prev => prev + 1);
          
          // If this is the last retry, provide a fallback
          if (retryCount + 1 >= MAX_RETRIES) {
            const stepDescription = content.includes(':') 
              ? content.split(":")[1]?.trim() || ""
              : content;
            const fallbackContent = `# ${title}\n\nWe're experiencing some technical difficulties generating the detailed content for this step. Please try refreshing the page or check back later.\n\n**What You Should Know:**\n\n- This section covers ${title}\n- ${stepDescription}\n\nOur team is working to resolve this issue as quickly as possible.`;
            onContentLoaded(fallbackContent);
            console.log(`Using fallback content for step: ${stepId} after error`);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadContent();
  }, [detailedContent, stepId, title, content, topic, isLoading, hasAttemptedLoad, onContentLoaded, isFirstStep, retryCount]);

  return null; // This is a non-visual component
};

export default ContentDetailLoader;
