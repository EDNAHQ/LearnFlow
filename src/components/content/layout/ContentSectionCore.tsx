
import React, { useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { getMarkdownComponents } from "@/utils/markdown/markdownComponents";
import ContentQuestionsSection from "../questions/ContentQuestionsSection";
import LearningModesToolbar from "../common/LearningModesToolbar";

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

  const getSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    // Ensure selection is inside the content area
    const range = selection.getRangeAt(0);
    const container = contentRef.current;
    if (!container) return null;
    if (!container.contains(range.commonAncestorContainer)) return null;
    const text = selection.toString().trim();
    return text.length > 0 ? text : null;
  }, []);

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

        {/* Learn-it-your-way toolbar */}
        <LearningModesToolbar
          content={loadedDetailedContent}
          topic={topic || undefined}
          title={title}
          getSelection={getSelection}
        />
      </div>
      
      {/* Margin notes removed */}
    </div>
  );
};

export default ContentSectionCore;
