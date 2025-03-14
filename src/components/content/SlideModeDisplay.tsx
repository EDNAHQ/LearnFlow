
import React from "react";
import PresentationView from "../presentation/PresentationView";

interface SlideModeDisplayProps {
  title: string;
  content: string;
  detailedContent?: string | null;
}

const SlideModeDisplay = ({ 
  title, 
  content, 
  detailedContent 
}: SlideModeDisplayProps) => {
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
    <div className="bg-[#1A1A1A] rounded-xl shadow-md overflow-hidden w-full mx-auto">
      <PresentationView 
        content={displayContent} 
        title={title}
      />
    </div>
  );
};

export default SlideModeDisplay;
