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
      className="relative max-w-4xl mx-auto px-3 sm:px-4 md:px-6 flex-shrink-0 pt-4 sm:pt-6 pb-4 sm:pb-6 md:pb-20 lg:pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 text-sm sm:text-base border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-lg"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Try Another Topic
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
          <Button
            onClick={handleApprove}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-sm sm:text-base md:text-lg brand-gradient text-white shadow-md shadow-brand-purple/20 hover:shadow-brand-purple/30 transition-all duration-300 rounded-lg font-bold"
          >
            Approve & Start Learning
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlanActionButtons;
