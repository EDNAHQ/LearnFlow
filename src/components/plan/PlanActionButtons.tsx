
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, ArrowRight, Sparkles } from "lucide-react";

interface PlanActionButtonsProps {
  handleReset: () => void;
  handleApprove: () => Promise<void>;
}

const PlanActionButtons = ({ handleReset, handleApprove }: PlanActionButtonsProps) => {
  return (
    <motion.div
      className="relative mt-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5]/5 via-[#ca5a8b]/5 to-[#f2b347]/5 rounded-3xl blur-xl" />

      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#6654f5]/10 to-[#ca5a8b]/10 mb-3"
          >
            <Sparkles className="w-4 h-4 text-[#6654f5]" />
            <span className="text-sm font-medium text-[#6654f5]">Ready to start?</span>
          </motion.div>
          <p className="text-gray-600">Review your personalized learning plan and begin your journey</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 px-6 py-6 text-base border-2 border-gray-200 hover:border-[#f2b347]/30 text-gray-600 hover:text-[#f2b347] hover:bg-gradient-to-r hover:from-[#f2b347]/5 hover:to-[#ca5a8b]/5 transition-all duration-300 rounded-xl"
            >
              <RefreshCw className="h-5 w-5" />
              Try Another Topic
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleApprove}
              className="gap-2 px-8 py-6 text-base brand-gradient text-white shadow-xl shadow-[#6654f5]/20 hover:shadow-2xl hover:shadow-[#6654f5]/30 transition-all duration-300 rounded-xl group"
            >
              <Check className="h-5 w-5" />
              Approve Plan & Start Learning
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanActionButtons;
