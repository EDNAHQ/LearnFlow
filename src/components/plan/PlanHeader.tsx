
import { ArrowLeft, Trash2, Target, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
    <div className="mb-12 text-center relative">
      {/* Animated background decoration */}
      <motion.div
        className="absolute inset-0 flex justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-64 h-64 bg-gradient-to-br from-[#6654f5]/10 via-[#ca5a8b]/10 to-[#f2b347]/10 rounded-full blur-2xl absolute -top-16" />
      </motion.div>

      {/* Icon with gradient background */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="inline-flex justify-center items-center mb-6 relative"
      >
        <div className="w-20 h-20 rounded-2xl brand-gradient shadow-2xl shadow-[#6654f5]/30 flex items-center justify-center relative">
          <BookOpen className="h-10 w-10 text-white" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-5 w-5 text-[#f2b347]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title with gradient text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent"
      >
        Your Learning Journey
      </motion.h1>

      {/* Description with topic highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <p className="text-lg text-gray-600 mb-3">
          A personalized 10-step plan to master
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6654f5]/10 via-[#ca5a8b]/10 to-[#f2b347]/10 border border-[#6654f5]/20">
          <Target className="w-5 h-5 text-[#6654f5]" />
          <span className="text-xl font-semibold bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] bg-clip-text text-transparent">
            {topic}
          </span>
        </div>
      </motion.div>
      
      {!loading && !authError && pathId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200 hover:border-red-300 transition-all duration-300"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Plan
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Learning Plan</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this learning plan and all its content.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-300"
                onClick={handleDeletePlan}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Plan"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      )}
    </div>
  );
};

export default PlanHeader;
