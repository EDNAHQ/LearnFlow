
import React, { useRef, useCallback, useState, useEffect } from "react";
import SafeReactMarkdown from "@/components/ui/SafeReactMarkdown";
import remarkGfm from "remark-gfm";
import { getMarkdownComponents } from "@/utils/markdown/markdownComponents";
import { preprocessContent } from "@/utils/markdown/contentPreprocessor";
import ContentQuestionsSection from "../questions/ContentQuestionsSection";
import LearningModesToolbar from "../common/LearningModesToolbar";
import { ContentStyleAdjuster } from "../common/ContentStyleAdjuster";
import { supabase } from "@/integrations/supabase/client";

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
  // Manage local content state for immediate updates
  const [currentContent, setCurrentContent] = useState(loadedDetailedContent);
  
  // Update local content when prop changes
  useEffect(() => {
    setCurrentContent(loadedDetailedContent);
  }, [loadedDetailedContent]);

  // Create a ref for the content area for margin notes
  const contentRef = useRef<HTMLDivElement>(null);

  // Create markdown components with question handlers
  const markdownComponents = getMarkdownComponents(
    topic || undefined,
    onQuestionClick
  );

  // Preprocess content to detect and format code blocks
  const processedContent = preprocessContent(currentContent);

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

  const handleContentReplace = useCallback(async (newContent: string) => {
    if (!stepId) return;
    
    try {
      const { error } = await supabase
        .from('learning_steps')
        .update({ detailed_content: newContent })
        .eq('id', stepId);

      if (error) throw error;

      // Update local state immediately for instant UI feedback
      setCurrentContent(newContent);

      if (onContentUpdated) {
        onContentUpdated(newContent);
      }
    } catch (error) {
      console.error('Error replacing content:', error);
    }
  }, [stepId, onContentUpdated]);

  return (
    <div className="content-area-wrapper">
      <div
        ref={contentRef}
        className="content-area"
      >
        {/* Learn-it-your-way toolbar at the top */}
        <LearningModesToolbar
          content={currentContent}
          topic={topic || undefined}
          title={title}
          getSelection={getSelection}
          onContentReplace={stepId ? handleContentReplace : undefined}
        />

        <SafeReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {processedContent}
        </SafeReactMarkdown>
        
        {/* Related questions at the bottom of content */}
        {topic && (
          <ContentQuestionsSection 
            loadedDetailedContent={currentContent}
            topic={topic}
            title={title}
            stepId={stepId}
            onQuestionClick={onQuestionClick}
          />
        )}

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
