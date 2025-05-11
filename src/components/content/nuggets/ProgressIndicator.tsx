
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
  // Force progress to 100% in more situations to prevent the "stuck at 9/10" visual issue
  const displayProgress = 
    // If nearly done with progress OR close to generating all steps
    (progress >= 85 && generatedSteps >= totalSteps - 1) ||
    // If generated most steps but progress is lagging
    (generatedSteps >= totalSteps - 1 && progress >= 80) ||
    // If we have all steps generated regardless of progress
    (generatedSteps >= totalSteps)
      ? 100 
      : progress;
  
  const getProgressMessage = () => {
    // Force "Content ready" message in more cases
    if ((!generatingContent && progress >= 85) || 
        (generatedSteps >= totalSteps - 1 && progress >= 85) ||
        (generatedSteps >= totalSteps)) {
      return "Content ready! You'll be redirected automatically.";
    }
    
    if (generatingContent && generatedSteps === 0) {
      return "Creating concise learning content...";
    }

    if (generatedSteps >= totalSteps - 1 && progress >= 80) {
      return "Finalizing content...";
    }
    
    return `Generating content... ${Math.round(displayProgress)}%`;
  };

  return (
    <div className="w-full max-w-md">
      <Progress 
        value={displayProgress} 
        className="h-2 w-full mb-6"
        indicatorClassName="bg-gradient-to-r from-[#6D42EF] to-[#E84393] animate-pulse"
      />
      
      <div className="flex items-center justify-center gap-2 mb-2">
        {generatingContent && displayProgress < 100 && (
          <Loader2 className="h-4 w-4 animate-spin text-[#E84393]" />
        )}
        <p className="text-gray-600 text-sm font-medium">
          {getProgressMessage()}
        </p>
      </div>
      
      {generatingContent && (
        <p className="text-gray-500 text-xs text-center">
          Generated {generatedSteps} of {totalSteps} content pieces
          {(generatedSteps >= totalSteps - 1 && progress >= 80) && (
            <span className="text-[#6D42EF]"> (Finalizing...)</span>
          )}
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;
