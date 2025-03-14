
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
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full max-w-[860px] mx-auto">
      <PresentationView 
        content={detailedContent || content.split(":")[1] || ""} 
        title={title}
      />
    </div>
  );
};

export default SlideModeDisplay;
