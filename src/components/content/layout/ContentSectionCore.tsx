
import React, { useRef, useCallback } from "react";
import SafeReactMarkdown from "@/components/ui/SafeReactMarkdown";
import remarkGfm from "remark-gfm";
import { getMarkdownComponents } from "@/utils/markdown/markdownComponents";
import { preprocessContent } from "@/utils/markdown/contentPreprocessor";
import ContentQuestionsSection from "../questions/ContentQuestionsSection";
import LearningModesToolbar from "../common/LearningModesToolbar";
import { ContentStyleAdjuster } from "../common/ContentStyleAdjuster";

interface ContentSectionCoreProps {
  loadedDetailedContent: string;
  topic?: string | null;
  title?: string;
  stepId?: string;
  pathId?: string;
  stepNumber?: number;
  totalSteps?: number;
  onQuestionClick?: (question: string, content?: string) => void;
  onContentUpdated?: (newContent: string) => void;
}

const ContentSectionCore = ({
  loadedDetailedContent,
  topic,
  title,
  stepId,
  pathId,
  stepNumber,
  totalSteps,
  onQuestionClick,
  onContentUpdated
}: ContentSectionCoreProps) => {
  // Create a ref for the content area for margin notes
  const contentRef = useRef<HTMLDivElement>(null);

  // Create markdown components with question handlers
  const markdownComponents = getMarkdownComponents(
    topic || undefined,
    onQuestionClick
  );

  // Preprocess content to detect and format code blocks
  const processedContent = preprocessContent(loadedDetailedContent);

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
        <SafeReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {processedContent}
        </SafeReactMarkdown>
        
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

        {/* Style adjustment button */}
        {stepId && topic && title && (
          <div className="mt-4 flex justify-end">
            <ContentStyleAdjuster
              stepId={stepId}
              topic={topic}
              title={title}
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              pathId={pathId || undefined}
              onContentUpdated={onContentUpdated}
            />
          </div>
        )}
      </div>
      
      {/* Margin notes removed */}
    </div>
  );
};

export default ContentSectionCore;
