
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PlanActionButtonsProps {
  handleReset: () => void;
  handleApprove: () => Promise<void>;
}

const PlanActionButtons = ({ handleReset, handleApprove }: PlanActionButtonsProps) => {
  return (
    <motion.div
      className="relative mt-16 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5]/10 via-[#ca5a8b]/10 to-[#f2b347]/10 rounded-3xl blur-2xl" />

      <div className="relative bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-gray-100 shadow-2xl">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="px-6 py-3 rounded-full bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] shadow-lg">
              <span className="text-base font-semibold text-white">Ready to Begin?</span>
            </div>
          </motion.div>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Your personalized learning journey awaits. Approve your plan to unlock all content and start mastering your topic.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 rounded-2xl shadow-md hover:shadow-lg"
            >
              Try Another Topic
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleApprove}
              className="w-full sm:w-auto px-10 py-6 text-lg brand-gradient text-white shadow-2xl shadow-[#6654f5]/30 hover:shadow-3xl hover:shadow-[#6654f5]/40 transition-all duration-300 rounded-2xl font-semibold"
            >
              Approve & Start Learning
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanActionButtons;
