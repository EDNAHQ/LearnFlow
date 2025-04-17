
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  progress: number;
  generatingContent: boolean;
  generatedSteps: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  generatingContent,
  generatedSteps,
  totalSteps
}) => {
  const getProgressMessage = () => {
    if (!generatingContent && progress >= 100) {
      return "Content ready! You'll be redirected automatically.";
    }
    
    if (generatingContent && generatedSteps === 0) {
      return "Creating concise learning content...";
    }
    
    return `Generating content... ${Math.round(progress)}%`;
  };

  return (
    <div className="w-full max-w-md">
      <Progress 
        value={progress} 
        className="h-2 w-full mb-6"
        indicatorClassName="bg-gradient-to-r from-[#6D42EF] to-[#E84393] animate-pulse"
      />
      
      <div className="flex items-center justify-center gap-2 mb-2">
        {generatingContent && (
          <Loader2 className="h-4 w-4 animate-spin text-[#E84393]" />
        )}
        <p className="text-gray-600 text-sm font-medium">
          {getProgressMessage()}
        </p>
      </div>
      
      {generatingContent && (
        <p className="text-gray-500 text-xs text-center">
          Generated {generatedSteps} of {totalSteps} content pieces
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;
