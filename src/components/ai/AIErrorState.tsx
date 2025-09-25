import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_STYLES } from "./constants";
import { cn } from "@/lib/utils";

interface AIErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const AIErrorState = ({
  message = "Failed to generate AI content. Please try again.",
  onRetry,
  className,
  compact = false
}: AIErrorStateProps) => {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-red-500 text-sm", className)}>
        <AlertCircle className="h-4 w-4" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className={cn("text-center py-6", className)}>
      <div className="flex justify-center mb-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <p className="text-sm text-red-500 mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className={cn(AI_STYLES.buttons.aiOutline)}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default AIErrorState;