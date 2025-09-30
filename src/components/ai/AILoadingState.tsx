import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AI_STYLES } from "./constants";
import { cn } from "@/lib/utils";

interface AILoadingStateProps {
  message?: string | null;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "animated";
  className?: string;
}

const AILoadingState = ({
  // Default to no message – we want a clean logo-only loading state
  message = null,
  size = "md",
  variant = "default",
  className
}: AILoadingStateProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  const iconSize = sizeClasses[size];

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className={cn(iconSize, AI_STYLES.animations.spinner)} />
        {message && <span className={cn("text-sm", AI_STYLES.text.muted)}>{message}</span>}
      </div>
    );
  }

  if (variant === "animated") {
    return (
      <motion.div
        className={cn("flex flex-col items-center py-6", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* LearnFlow animated logo (replaces generic spinner + message) */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-2xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight">
            LearnFlow
          </span>
        </motion.div>
        {message && (
          <p className={cn("mt-3 text-sm font-medium", AI_STYLES.text.muted)}>{message}</p>
        )}
      </motion.div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      {/* Minimal logo pulse for default variant as well */}
      <motion.div
        className="flex items-center"
        animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight">
          LearnFlow
        </span>
      </motion.div>
      {message && <p className={cn("mt-2 text-sm", AI_STYLES.text.muted)}>{message}</p>}
    </div>
  );
};

export default AILoadingState;