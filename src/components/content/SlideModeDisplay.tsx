
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
  // Always ensure we're working with strings
  const displayContent = typeof detailedContent === 'string' 
    ? detailedContent 
    : (typeof content === 'string' ? content : String(content || ""));
  
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
