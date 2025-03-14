
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
  // Simply use detailed content if available, otherwise use content
  // Both should be strings by this point
  const displayContent = detailedContent || content;

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
