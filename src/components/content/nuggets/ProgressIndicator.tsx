
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
  // Force progress to 100% if we're very close to completion
  // This prevents the "stuck at 9/10" visual issue
  const displayProgress = progress >= 90 && generatedSteps >= totalSteps - 1 
    ? 100 
    : progress;
  
  const getProgressMessage = () => {
    // Force "Content ready" message when we're at 9/10 or higher and nearly done
    if ((!generatingContent && progress >= 90) || 
        (generatedSteps >= totalSteps - 1 && progress >= 90)) {
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
        value={displayProgress} 
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
          {generatedSteps >= totalSteps - 1 && progress >= 90 && (
            <span className="text-[#6D42EF]"> (Finalizing...)</span>
          )}
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;
