
import React from "react";
import PresentationView from "../presentation/PresentationView";

interface SlideModeDisplayProps {
  title: string;
  content: string;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  onQuestionClick?: (question: string) => void;
}

const SlideModeDisplay = ({ 
  title, 
  content, 
  detailedContent,
  pathId,
  topic,
  onQuestionClick
}: SlideModeDisplayProps) => {
  // Convert content to string with better handling of complex objects
  const safeContent = (() => {
    if (typeof content === 'string') {
      return content;
    }
    
    try {
      // Handle null, undefined, and objects
      if (content === null || content === undefined) {
        return "No content available";
      }
      
      if (typeof content === 'object') {
        return JSON.stringify(content, null, 2);
      }
      
      return String(content);
    } catch (error) {
      console.error("Error processing content in SlideModeDisplay:", error);
      return "Error displaying content";
    }
  })();
  
  // Same for detailed content, with preference for detailed content when available
  const displayContent = (() => {
    if (typeof detailedContent === 'string' && detailedContent) {
      return detailedContent;
    }
    
    try {
      if (detailedContent === null || detailedContent === undefined) {
        return safeContent;
      }
      
      if (typeof detailedContent === 'object') {
        return JSON.stringify(detailedContent, null, 2);
      }
      
      return String(detailedContent);
    } catch (error) {
      console.error("Error processing detailedContent in SlideModeDisplay:", error);
      return safeContent;
    }
  })();
  
  return (
    <div className="bg-[#1A1A1A] rounded-xl shadow-md overflow-hidden w-full mx-auto">
      <PresentationView 
        content={displayContent} 
        title={title}
      />
    </div>
  );
};

export default SlideModeDisplay;
