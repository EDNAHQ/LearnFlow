
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

const LoadingAnimation: React.FC = () => {
  return (
    <motion.div
      className="relative mb-4"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Loader2 className={cn("w-12 h-12 animate-spin", AI_STYLES.text.primary)} />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Sparkles className={cn("w-5 h-5", AI_STYLES.text.accent)} />
      </motion.div>
    </motion.div>
  );
};

export default LoadingAnimation;
