import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanHeaderProps {
  topic: string;
  pathId: string | null;
  loading: boolean;
  authError: boolean;
  isDeleting: boolean;
  handleReset: () => void;
  handleDeletePlan: () => Promise<void>;
}

const PlanHeader = ({
  topic,
  pathId,
  loading,
  authError,
  isDeleting,
  handleReset,
  handleDeletePlan,
}: PlanHeaderProps) => {
  return (
    <div className="relative w-full pt-4 sm:pt-6 pb-2 sm:pb-3 px-4 sm:px-6 lg:px-8 flex-shrink-0">
      {/* Exit button - top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute top-3 right-4 sm:top-4 sm:right-6 z-20"
      >
        <Button
          onClick={handleReset}
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all duration-200"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </motion.div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto text-center">
        {/* Title with gradient text - Bold and prominent */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 text-gradient leading-tight"
        >
          Your Learning Plan
        </motion.h1>

        {/* Topic highlight */}
        {topic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.6, type: "spring" }}
            className="inline-block mt-2"
          >
            <div className="relative px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 backdrop-blur-sm border border-brand-purple/20 shadow-lg">
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gradient">
                {topic}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlanHeader;
