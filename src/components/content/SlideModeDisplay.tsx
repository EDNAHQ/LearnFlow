
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
  // Simply use detailed content if available, otherwise use content
  const displayContent = detailedContent || content;
  
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
