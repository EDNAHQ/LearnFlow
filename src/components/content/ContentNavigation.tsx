
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ContentNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onComplete: () => void;
  isLastStep: boolean;
  isSubmitting?: boolean;
  projectCompleted?: boolean;
  isGeneratingContent?: boolean;
}

const ContentNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onComplete,
  isLastStep,
  isSubmitting = false,
  projectCompleted = false,
  isGeneratingContent = false
}: ContentNavigationProps) => {
  return (
    <motion.div 
      className="flex justify-between items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Button
        onClick={onPrevious}
        variant="outline"
        className="flex items-center gap-1"
        disabled={isSubmitting}
      >
        <ArrowLeft className="w-4 h-4" />
        Previous
      </Button>

      <Button
        onClick={onComplete}
        className="ml-auto flex items-center gap-1.5 bg-[#6D42EF] hover:bg-[#6D42EF]/90 text-white"
        disabled={isSubmitting || projectCompleted || isGeneratingContent}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isLastStep ? "Finalizing..." : "Saving..."}
          </>
        ) : projectCompleted ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </>
        ) : isGeneratingContent ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            {isLastStep ? "Complete Project" : "Mark Complete"}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default ContentNavigation;
