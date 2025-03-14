
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
  // Use detailed content if available, otherwise clean up the content string
  const displayContent = detailedContent || 
    (content.includes(':') ? content.split(':').slice(1).join(':').trim() : content);
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full mx-auto">
      <PresentationView 
        content={displayContent} 
        title={title}
      />
    </div>
  );
};

export default SlideModeDisplay;
