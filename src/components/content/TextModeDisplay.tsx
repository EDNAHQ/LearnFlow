
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
  // Extract the actual content if it contains a colon (step ID format)
  const extractContent = (rawContent: string) => {
    const colonIndex = rawContent.indexOf(':');
    return colonIndex > -1 ? rawContent.substring(colonIndex + 1).trim() : rawContent;
  };

  // Process the content to ensure we're not displaying "[object Object]"
  const processedContent = typeof content === 'string' ? extractContent(content) : 'No content available';
  
  // Use detailed content if available, otherwise use the processed content
  const displayContent = detailedContent || processedContent;

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
