
import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  progress: number;
  generatingContent: boolean;
  generatedSteps: number;
  totalSteps: number;
  isPodcast?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  generatingContent,
  generatedSteps,
  totalSteps,
  isPodcast = false
}) => {
  const getProgressMessage = () => {
    if (isPodcast) {
      if (!generatingContent && progress >= 100) {
        return "Podcast script ready!";
      }
      return `Generating podcast script... ${Math.round(progress)}%`;
    }
    
    if (!generatingContent && progress >= 100) {
      return "Content ready! You'll be redirected automatically.";
    }
    
    return `Generating content... ${Math.round(progress)}%`;
  };

  return (
    <div className="w-full max-w-md">
      <Progress 
        value={progress} 
        className="h-2 mb-2" 
        indicatorClassName="bg-gradient-to-r from-[#6D42EF] to-[#E84393]"
      />
      
      <p className="text-gray-600 text-sm mt-4">
        {getProgressMessage()}
      </p>
      
      {generatingContent && (
        <p className="text-gray-500 text-xs mt-2">
          {isPodcast ? "Analyzing project content..." : `Generated ${generatedSteps} of ${totalSteps} content pieces`}
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;
