
import { memo } from "react";
import ContentLoader from "./content/ContentLoader";
import ContentDetailLoader from "./content/ContentDetailLoader";
import ContentSectionCore from "./content/ContentSectionCore";
import ContentSectionContainer from "./content/ContentSectionContainer";
import ContentSectionConcepts from "./content/ContentSectionConcepts";
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
}

// Use memo to prevent unnecessary re-renders
const ContentSection = memo(({ title, content, index, detailedContent, topic }: ContentSectionProps) => {
  const { handleTextSelection } = useTextSelection();
  
  // Use the extracted hook for state management
  const {
    isVisible,
    loadedDetailedContent,
    contentLoaded,
    stepId,
    concepts,
    handleContentLoaded,
    handleConceptClick
  } = useContentSection({ content, detailedContent, topic });
  
  // Handle question clicking
  const handleQuestionClick = (question: string) => {
    // This gets passed down to child components
    // The actual implementation is in ContentInsightsManager
    console.log("Question clicked:", question);
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
        <ContentLoader />
      ) : (
        <>
          <ContentSectionCore
            loadedDetailedContent={loadedDetailedContent}
            topic={topic}
            title={title}
            stepId={stepId}
            onTextSelection={handleTextSelection}
            onQuestionClick={handleQuestionClick}
          />
          
          {/* Only show the concept network if we have concepts */}
          {concepts && concepts.length > 0 && topic && (
            <ContentSectionConcepts 
              concepts={concepts}
              onConceptClick={handleConceptClick}
              currentTopic={topic}
            />
          )}
        </>
      )}
    </ContentSectionContainer>
  );
});

// Add display name for better debugging
ContentSection.displayName = "ContentSection";

export default ContentSection;
