import { memo } from "react";
import ContentLoader from "../ContentLoader";
import ContentDetailLoader from "../ContentDetailLoader";
import ContentSectionCore from "../ContentSectionCore";
import ContentSectionContainer from "../ContentSectionContainer";
import { useContentSection } from "@/hooks/useContentSection";
import { useTextSelection } from "@/hooks/useTextSelection";
import "@/styles/content.css";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  onQuestionClick?: (question: string) => void;
}

// Use memo to prevent unnecessary re-renders
const ContentSection = memo(({ title, content, index, detailedContent, topic, pathId, onQuestionClick }: ContentSectionProps) => {
  const { handleTextSelection } = useTextSelection();
  
  // Use the extracted hook for state management
  const {
    isVisible,
    loadedDetailedContent,
    contentLoaded,
    stepId,
    concepts,
    handleContentLoaded,
    handleConceptClick,
    focusedConcept
  } = useContentSection({ content, detailedContent, topic });
  
  // Handle question clicking - pass it to ContentInsightsManager via ContentPage
  const handleQuestionClick = (question: string) => {
    // First try to use the prop if provided
    if (onQuestionClick) {
      onQuestionClick(question);
      return;
    }
    
    // Fallback to dispatching an event
    console.log("Question clicked in ContentSection:", question);
    
    // Create a custom event to communicate with ContentInsightsManager
    const event = new CustomEvent("ai:insight-request", {
      detail: { question, topic }
    });
    
    // Dispatch the event so ContentInsightsManager can catch it
    window.dispatchEvent(event);
  };

  return (
    <ContentSectionContainer isVisible={isVisible}>
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
        <ContentLoader message="Loading content..." />
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
    </ContentSectionContainer>
  );
});

// Add display name for better debugging
ContentSection.displayName = "ContentSection";

export default ContentSection;


