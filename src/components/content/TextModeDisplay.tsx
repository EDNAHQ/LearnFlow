
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
  // Convert content to string no matter what the input type is
  const safeContent = typeof content === 'string' 
    ? content 
    : (content ? JSON.stringify(content) : "No content available");
  
  // Same for detailed content
  const safeDetailedContent = typeof detailedContent === 'string' 
    ? detailedContent 
    : (detailedContent ? JSON.stringify(detailedContent) : null);

  return (
    <div className="w-full">
      <ContentSection 
        title={title}
        content={safeContent}
        index={index}
        detailedContent={safeDetailedContent}
        pathId={pathId}
        topic={topic}
      />
    </div>
  );
};

export default TextModeDisplay;
