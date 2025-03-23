
import { useState, useEffect, useRef, useCallback } from "react";
import { formatContent } from "@/utils/contentFormatter";
import ContentMarginNotesRenderer from "./ContentMarginNotesRenderer";
import ContentHelperTip from "../ContentHelperTip";
import ContentQuestionsSection from "./ContentQuestionsSection";

interface ContentSectionCoreProps {
  loadedDetailedContent: string;
  topic?: string;
  title: string;
  stepId: string;
  onTextSelection: (event: React.MouseEvent | React.TouchEvent) => void;
  onQuestionClick: (question: string) => void;
}

const ContentSectionCore = ({
  loadedDetailedContent,
  topic,
  title,
  stepId,
  onTextSelection,
  onQuestionClick
}: ContentSectionCoreProps) => {
  // Track if margin notes have been generated to prevent regeneration
  const marginNotesGenerated = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      className="prose prose-gray max-w-none w-full"
      onMouseUp={onTextSelection}
      onTouchEnd={onTextSelection}
    >
      <div 
        className="content-section relative"
        ref={contentRef}
      >
        {formatContent(loadedDetailedContent, topic, onQuestionClick)}
      </div>
      
      {/* Margin Notes Renderer - Adds margin notes to content */}
      {!marginNotesGenerated.current && topic && (
        <ContentMarginNotesRenderer
          content={loadedDetailedContent}
          topic={topic}
          contentRef={contentRef}
          onNotesGenerated={() => {marginNotesGenerated.current = true}}
        />
      )}
      
      {/* Questions Section */}
      <ContentQuestionsSection
        loadedDetailedContent={loadedDetailedContent}
        topic={topic}
        title={title}
        stepId={stepId}
        onQuestionClick={onQuestionClick}
      />
      
      <ContentHelperTip />
    </div>
  );
};

export default ContentSectionCore;
