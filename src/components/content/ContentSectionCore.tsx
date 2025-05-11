
import React from "react";
import ReactMarkdown from "react-markdown";
import { getMarkdownComponents } from "@/utils/markdown/markdownComponents";
import ContentMarginNotesRenderer from "./ContentMarginNotesRenderer";
import ContentSectionConcepts from "./ContentSectionConcepts";
import ContentQuestionsSection from "./ContentQuestionsSection";

interface ContentSectionCoreProps {
  loadedDetailedContent: string;
  topic?: string | null;
  title?: string;
  stepId?: string;
  onTextSelection?: (e: React.MouseEvent | React.TouchEvent) => void;
  onQuestionClick?: (question: string) => void;
}

const ContentSectionCore = ({ 
  loadedDetailedContent, 
  topic, 
  title, 
  stepId,
  onTextSelection,
  onQuestionClick
}: ContentSectionCoreProps) => {
  // Create markdown components with question and concept handlers
  const markdownComponents = getMarkdownComponents(
    topic || undefined,
    onQuestionClick,  // Pass the question click handler
    [], // Concepts array could be passed here if available
    undefined // Concept click handler could be passed here if needed
  );
  
  return (
    <div className="content-area-wrapper">
      <div 
        className="content-area"
        onMouseUp={onTextSelection}
        onTouchEnd={onTextSelection}
      >
        <ReactMarkdown components={markdownComponents}>
          {loadedDetailedContent}
        </ReactMarkdown>
        
        {/* Related questions at the bottom of content */}
        {topic && (
          <ContentQuestionsSection 
            contentText={loadedDetailedContent}
            topic={topic}
            onQuestionClick={onQuestionClick}
          />
        )}
      </div>
      
      {/* Margin notes renderer if needed */}
      <ContentMarginNotesRenderer 
        content={loadedDetailedContent} 
        topic={topic || ""} 
      />
    </div>
  );
};

export default ContentSectionCore;
