
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
  // Improved content processing to handle all possible types
  const safeContent = (() => {
    if (typeof content === 'string') {
      return content;
    }
    
    try {
      if (content === null || content === undefined) {
        return "No content available";
      }
      
      if (typeof content === 'object') {
        return JSON.stringify(content, null, 2);
      }
      
      return String(content);
    } catch (error) {
      console.error("Error processing content in TextModeDisplay:", error);
      return "Error displaying content";
    }
  })();
  
  // Same for detailed content
  const safeDetailedContent = (() => {
    if (typeof detailedContent === 'string' && detailedContent) {
      return detailedContent;
    }
    
    if (!detailedContent) {
      return null; // Keep null if not provided
    }
    
    try {
      if (typeof detailedContent === 'object') {
        return JSON.stringify(detailedContent, null, 2);
      }
      
      return String(detailedContent);
    } catch (error) {
      console.error("Error processing detailedContent in TextModeDisplay:", error);
      return null;
    }
  })();

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
