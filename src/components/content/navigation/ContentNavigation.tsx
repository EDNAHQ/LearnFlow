
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 mb-4"
    >
      {/* Previous Arrow */}
      <button
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="group flex items-center gap-2 text-gray-600 hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Previous</span>
      </button>

      {/* Center Progress Info */}
      <div className="text-center order-1 sm:order-none">
        <p className="text-xs text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      {/* Next/Complete Button */}
      {!isLastStep ? (
        <button
          onClick={onComplete}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-primary to-brand-accent text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <span>Mark Complete</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onComplete}
          disabled={isSubmitting || projectCompleted}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity ${
            projectCompleted
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-highlight to-brand-accent text-white hover:opacity-90'
          }`}
        >
          {isSubmitting ? (
            "Completing..."
          ) : projectCompleted ? (
            <>✓ Completed</>
          ) : (
            <>
              <span>Complete Project</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};

export default ContentNavigation;
