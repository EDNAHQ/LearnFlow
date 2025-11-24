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
    <div className="relative w-full pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 px-3 sm:px-4 md:px-6 lg:px-8 flex-shrink-0">
      {/* Exit button - top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute top-2 right-3 sm:top-3 sm:right-4 md:top-4 md:right-6 z-20"
      >
        <Button
          onClick={handleReset}
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all duration-200"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </Button>
      </motion.div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto text-center">
        {/* Title with gradient text - Compact on mobile */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-1 sm:mb-2 text-gradient leading-tight px-8 sm:px-0"
        >
          Your Learning Plan
        </motion.h1>

        {/* Topic highlight - Compact on mobile */}
        {topic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.6, type: "spring" }}
            className="inline-block mt-1 sm:mt-2"
          >
            <div className="relative px-3 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 backdrop-blur-sm border border-brand-purple/20 shadow-md sm:shadow-lg">
              <span className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gradient line-clamp-2">
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
