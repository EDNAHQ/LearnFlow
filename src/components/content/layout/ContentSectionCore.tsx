
import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import { getMarkdownComponents } from "@/utils/markdown/markdownComponents";
import ContentQuestionsSection from "../questions/ContentQuestionsSection";

interface ContentSectionCoreProps {
  loadedDetailedContent: string;
  topic?: string | null;
  title?: string;
  stepId?: string;
  onQuestionClick?: (question: string, content?: string) => void;
}

const ContentSectionCore = ({
  loadedDetailedContent,
  topic,
  title,
  stepId,
  onQuestionClick
}: ContentSectionCoreProps) => {
  // Create a ref for the content area for margin notes
  const contentRef = useRef<HTMLDivElement>(null);

  // Create markdown components with question handlers
  const markdownComponents = getMarkdownComponents(
    topic || undefined,
    onQuestionClick
  );

  return (
    <div className="content-area-wrapper">
      <div
        ref={contentRef}
        className="content-area"
      >
        <ReactMarkdown components={markdownComponents}>
          {loadedDetailedContent}
        </ReactMarkdown>
        
        {/* Related questions at the bottom of content */}
        {topic && (
          <ContentQuestionsSection 
            loadedDetailedContent={loadedDetailedContent}
            topic={topic}
            title={title}
            stepId={stepId}
            onQuestionClick={onQuestionClick}
          />
        )}
      </div>
      
      {/* Margin notes removed */}
    </div>
  );
};

export default ContentSectionCore;
