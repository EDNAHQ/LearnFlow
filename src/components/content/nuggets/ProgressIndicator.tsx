
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

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
  const isIndeterminate = generatingContent && totalSteps === 0;
  const displayProgress = isIndeterminate ? 100 : progress;

  const getProgressMessage = () => {
    if (!generatingContent || generatedSteps >= totalSteps) {
      return "Content ready!";
    }

    if (isIndeterminate) return "Creating concise learning content...";

    return `Generating content... ${Math.round(displayProgress)}%`;
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative w-full mb-6">
        {isIndeterminate ? (
          <div className="h-2 w-full overflow-hidden rounded bg-gray-100">
            <div className={cn("h-full w-1/3 rounded animate-[shimmer_1.4s_infinite]", AI_STYLES.gradients.brand)} />
          </div>
        ) : (
          <Progress
            value={displayProgress}
            className="h-2 w-full"
            indicatorClassName={cn(AI_STYLES.gradients.brand, "animate-pulse")}
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        {generatingContent && displayProgress < 100 && (
          <Loader2 className={cn("h-4 w-4 animate-spin", AI_STYLES.text.accent)} />
        )}
        <p className={cn("text-sm font-medium", AI_STYLES.text.muted)}>
          {getProgressMessage()}
        </p>
      </div>
      
      {generatingContent && !isIndeterminate && (
        <p className="text-gray-500 text-xs text-center">
          Generated {generatedSteps} of {totalSteps} content pieces
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;
