import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";

interface PlanActionButtonsProps {
  handleReset: () => void;
  handleApprove: () => Promise<void>;
}

const PlanActionButtons = ({ handleReset, handleApprove }: PlanActionButtonsProps) => {
  return (
    <motion.div
      className="relative max-w-4xl mx-auto px-4 sm:px-6 flex-shrink-0 pt-2 sm:pt-3 pb-20 sm:pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Content container - White background, more compact */}
      <div className="relative bg-white rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 shadow-md">
        <div className="text-center mb-3 sm:mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="inline-block mb-1.5 sm:mb-2"
          >
            <div className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full brand-gradient shadow-sm">
              <span className="text-xs sm:text-sm md:text-base font-bold text-white">Ready to Begin?</span>
            </div>
          </motion.div>
          <p className="text-xs sm:text-sm font-light text-gray-600 max-w-xl mx-auto mb-3">
            Your personalized learning journey awaits. Approve your plan to unlock all content and start mastering your topic.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-lg"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
              Try Another Topic
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleApprove}
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm md:text-base brand-gradient text-white shadow-md shadow-brand-purple/20 hover:shadow-brand-purple/30 transition-all duration-300 rounded-lg font-bold"
            >
              Approve & Start Learning
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanActionButtons;
