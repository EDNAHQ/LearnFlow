
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    <div className="mb-20 text-center relative py-16">
      {/* Animated background decoration */}
      <motion.div
        className="absolute inset-0 flex justify-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-[500px] h-[500px] bg-gradient-to-br from-[#6654f5]/20 via-[#ca5a8b]/15 to-[#f2b347]/20 rounded-full blur-3xl absolute -top-32 animate-pulse" />
      </motion.div>

      {/* Title with gradient text */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
        className="relative text-5xl md:text-6xl lg:text-7xl font-extrabold mb-10 bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent leading-relaxed px-4 pb-2"
      >
        Your Learning Plan
      </motion.h1>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="relative max-w-3xl mx-auto mb-10 px-4"
      >
        <p className="text-xl md:text-2xl text-gray-600 font-light">
          A personalized roadmap designed just for you
        </p>
      </motion.div>

      {/* Topic highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
        className="relative inline-block px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5]/20 via-[#ca5a8b]/20 to-[#f2b347]/20 rounded-3xl blur-xl" />
        <div className="relative px-6 py-3 md:px-8 md:py-4 rounded-3xl bg-white border-2 border-[#6654f5]/30 shadow-xl">
          <span className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent break-words">
            {topic}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanHeader;
