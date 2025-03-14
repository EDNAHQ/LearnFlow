
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
  // Extract the actual content by removing any step ID prefixes
  const cleanedContent = content.includes(':') 
    ? content.split(':').slice(1).join(':').trim() 
    : content;

  return (
    <div className="w-full">
      <ContentSection 
        title={title}
        content={cleanedContent}
        index={index}
        detailedContent={detailedContent}
        pathId={pathId}
        topic={topic}
      />
    </div>
  );
};

export default TextModeDisplay;
