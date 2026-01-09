import { AlertCircle, RotateCcw } from "lucide-react";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ContentErrorProps {
  message: string;
  onRetry: () => void;
}

const ContentError = ({ message, onRetry }: ContentErrorProps) => {
  return (
    <div className={cn("relative flex flex-col items-center justify-center py-12 my-8 rounded-lg overflow-hidden border-2 border-red-200 bg-red-50")}>
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
        <p className="text-red-900 mt-4 text-lg font-medium text-center">{message}</p>
        <p className="text-xs text-red-700 mt-2 text-center">
          This may be temporary. Try refreshing or contact support if the issue persists.
        </p>
        <Button
          onClick={onRetry}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ContentError;
