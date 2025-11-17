import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const PlanLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      {/* Animated loader */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-4 border-transparent border-t-brand-purple border-r-brand-pink"
          />
          {/* Inner spinning ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-b-brand-gold border-l-brand-purple"
          />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
        </div>
      </motion.div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <p className="text-2xl sm:text-3xl font-light text-brand-black mb-3">
          Crafting your personalized learning journey...
        </p>
        <p className="text-base sm:text-lg font-light text-brand-black/60">
          This may take up to 30 seconds
        </p>
      </motion.div>

      {/* Progress dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 mt-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-3 h-3 rounded-full brand-gradient"
          />
        ))}
      </motion.div>
    </div>
  );
};

export default PlanLoading;
