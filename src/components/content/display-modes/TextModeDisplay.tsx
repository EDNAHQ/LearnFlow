
import React from "react";
import ContentSection from "../common/ContentSection";

interface TextModeDisplayProps {
  title?: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  onQuestionClick?: (question: string) => void;
}

const TextModeDisplay = ({ 
  title = "", 
  content, 
  index, 
  detailedContent, 
  pathId, 
  topic,
  onQuestionClick
}: TextModeDisplayProps) => {
  // Convert content to string, ensuring we handle all possible types
  const processContent = (value: any): string => {
    if (value === null || value === undefined) {
      return "No content available";
    }

    if (typeof value === 'string') {
      return value;
    }

    try {
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    } catch (error) {
      console.error("Error processing content:", error);
      return "Error displaying content";
    }
  };

  const safeContent = processContent(content);
  const safeDetailedContent = detailedContent ? processContent(detailedContent) : null;

  return (
    <div className="w-full">
      <ContentSection 
        title={title}
        content={safeContent}
        index={index}
        detailedContent={safeDetailedContent}
        pathId={pathId}
        topic={topic}
        onQuestionClick={onQuestionClick}
      />
    </div>
  );
};

export default TextModeDisplay;
