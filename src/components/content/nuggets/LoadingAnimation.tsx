
import React from "react";
import { motion } from "framer-motion";
import { Loader2, BookOpen } from "lucide-react";

const LoadingAnimation: React.FC = () => {
  return (
    <motion.div 
      className="relative mb-4"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Loader2 className="w-12 h-12 animate-spin text-[#6D42EF]" />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <BookOpen className="w-5 h-5 text-[#E84393]" />
      </motion.div>
    </motion.div>
  );
};

export default LoadingAnimation;
