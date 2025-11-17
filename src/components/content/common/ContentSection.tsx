import { memo } from "react";
import ContentLoader from "../loading/ContentLoader";
import ContentDetailLoader from "../ContentDetailLoader";
import ContentSectionCore from "../layout/ContentSectionCore";
import ContentSectionContainer from "../layout/ContentSectionContainer";
import { useContentSection } from "@/hooks/content";
import "@/styles/content.css";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  onQuestionClick?: (question: string, content?: string) => void;
}

// Use memo to prevent unnecessary re-renders
const ContentSection = memo(({ title, content, index, detailedContent, topic, pathId, onQuestionClick }: ContentSectionProps) => {
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

  // Handle question clicking - pass it to parent with content
  const handleQuestionClick = (question: string) => {
    console.log("Question clicked in ContentSection:", question);
    if (onQuestionClick) {
      onQuestionClick(question, loadedDetailedContent);
    }
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
          pathId={pathId}
          onQuestionClick={handleQuestionClick}
        />
      )}
    </ContentSectionContainer>
  );
});

// Add display name for better debugging
ContentSection.displayName = "ContentSection";

export default ContentSection;


