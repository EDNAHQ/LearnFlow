
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRightCircle, CheckCircle, Loader2 } from "lucide-react";

interface ContentNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onComplete: () => void;
  isLastStep: boolean;
  isSubmitting: boolean;
  projectCompleted: boolean;
}

const ContentNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onComplete,
  isLastStep,
  isSubmitting,
  projectCompleted
}: ContentNavigationProps) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="text-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>
      
      {!isLastStep ? (
        <Button
          className="bg-[#6D42EF] hover:bg-[#6D42EF]/90 text-white"
          onClick={onComplete}
        >
          Mark Complete
          <ArrowRightCircle className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button
          className={`bg-[#F5B623] hover:bg-[#F5B623]/90 text-white ${projectCompleted ? 'cursor-not-allowed' : ''}`}
          onClick={onComplete}
          disabled={isSubmitting || projectCompleted}
        >
          {isSubmitting ? (
            <>
              Submitting...
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            </>
          ) : projectCompleted ? (
            <>
              Completed <CheckCircle className="w-4 h-4 ml-2" />
            </>
          ) : (
            "Complete Project"
          )}
        </Button>
      )}
    </div>
  );
};

export default ContentNavigation;
