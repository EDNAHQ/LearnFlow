
import React from "react";
import ContentSection from "../ContentSection";

interface TextModeDisplayProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const TextModeDisplay = ({ 
  title, 
  content, 
  index, 
  detailedContent, 
  pathId, 
  topic 
}: TextModeDisplayProps) => {
  // Always ensure we're working with strings
  const displayContent = typeof detailedContent === 'string' 
    ? detailedContent 
    : (typeof content === 'string' ? content : String(content || ""));

  return (
    <div className="w-full">
      <ContentSection 
        title={title}
        content={displayContent}
        index={index}
        detailedContent={detailedContent}
        pathId={pathId}
        topic={topic}
      />
    </div>
  );
};

export default TextModeDisplay;
