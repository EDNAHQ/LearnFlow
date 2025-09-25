
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative mt-12 mb-8"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-brand-accent/5 to-brand-highlight/5 rounded-3xl blur-xl" />

      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg">
        <div className="flex justify-between w-full max-w-[860px] mx-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 0}
              className="px-6 py-6 text-base font-semibold border-2 border-gray-300 hover:border-brand-accent text-gray-700 hover:text-brand-accent hover:bg-gradient-to-r hover:from-brand-accent/10 hover:to-brand-highlight/10 transition-all duration-300 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous Step
            </Button>
          </motion.div>

          {!isLastStep ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-xl hover:opacity-90 transition-all duration-300 rounded-full"
                onClick={onComplete}
              >
                Mark as Complete →
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: projectCompleted ? 1 : 1.02 }}
              whileTap={{ scale: projectCompleted ? 1 : 0.98 }}
            >
              <Button
                className={`px-8 py-6 text-base font-semibold ${
                  projectCompleted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-highlight to-brand-accent hover:opacity-90'
                } text-white shadow-xl transition-all duration-300 rounded-full`}
                onClick={onComplete}
                disabled={isSubmitting || projectCompleted}
              >
                {isSubmitting ? (
                  "Completing Project..."
                ) : projectCompleted ? (
                  "✓ Project Completed"
                ) : (
                  "Complete Project →"
                )}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Progress hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <p className="text-sm font-medium text-gray-700">
            {isLastStep
              ? projectCompleted
                ? "🎉 Congratulations on completing your learning journey!"
                : "You're on the final step! Complete it to finish your project."
              : `${totalSteps - currentStep - 1} ${
                  totalSteps - currentStep - 1 === 1 ? "step" : "steps"
                } remaining after this one`}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContentNavigation;
