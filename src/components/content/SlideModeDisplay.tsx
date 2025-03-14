
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
  // Convert content to string no matter what the input type is
  const safeContent = typeof content === 'string' 
    ? content 
    : (content ? JSON.stringify(content) : "No content available");
  
  // Same for detailed content, with preference for detailed content when available
  const displayContent = typeof detailedContent === 'string' 
    ? detailedContent 
    : safeContent;
  
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
