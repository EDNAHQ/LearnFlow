import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AI_STYLES } from "./constants";
import { cn } from "@/lib/utils";

interface AILoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "animated";
  className?: string;
}

const AILoadingState = ({
  message = "Generating AI insights...",
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
        <div className="relative">
          <Loader2 className={cn(iconSize, AI_STYLES.animations.spinner)} />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Sparkles className={cn(sizeClasses[size === "lg" ? "md" : "sm"], AI_STYLES.text.accent)} />
          </motion.div>
        </div>
        {message && (
          <p className={cn("mt-3 text-sm font-medium", AI_STYLES.text.muted)}>
            {message}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Loader2 className={cn(iconSize, AI_STYLES.animations.spinner, "mb-2")} />
      {message && (
        <p className={cn("text-sm", AI_STYLES.text.muted)}>{message}</p>
      )}
    </div>
  );
};

export default AILoadingState;