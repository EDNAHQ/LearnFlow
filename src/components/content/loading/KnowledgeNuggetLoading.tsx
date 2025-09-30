
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface KnowledgeNuggetLoadingProps {
  topic: string | null;
  goToProjects: () => void;
  generatingContent?: boolean;
  generatedSteps?: number;
  totalSteps?: number;
  pathId?: string | null;
}

const KnowledgeNuggetLoading = ({
  topic,
  goToProjects,
  generatingContent = true,
  generatedSteps = 0,
  totalSteps = 10,
  pathId = null
}: KnowledgeNuggetLoadingProps) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Smooth progress calculation
  useEffect(() => {
    if (totalSteps > 0) {
      const targetProgress = Math.min((generatedSteps / totalSteps) * 100, 100);

      // Smooth animation to target progress
      const duration = 500; // ms
      const startProgress = progress;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - t, 3);
        const currentProgress = startProgress + (targetProgress - startProgress) * eased;

        setProgress(currentProgress);

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [generatedSteps, totalSteps]);

  // Trigger exit animation when complete
  useEffect(() => {
    if (!generatingContent && generatedSteps === totalSteps && totalSteps > 0) {
      setIsExiting(true);
    }
  }, [generatingContent, generatedSteps, totalSteps]);

  const getFormattedTopic = () => {
    if (!topic) return "your learning journey";
    return topic.trim();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"
          />
        </div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Animated LearnFlow logo */}
          <motion.div
            className="mb-16 flex flex-col items-center"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-7xl md:text-8xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight leading-tight pb-2">
              LearnFlow
            </span>
            <motion.span
              className="text-sm font-semibold text-gray-400 tracking-wide uppercase mt-3"
              animate={{
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            >
              by Enterprise DNA
            </motion.span>
          </motion.div>

          {/* Topic text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent px-8 leading-tight"
          >
            {getFormattedTopic()}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600 text-center mb-12 text-xl md:text-2xl font-light px-8"
          >
            Crafting your personalized learning experience
          </motion.p>

          {/* Progress bar */}
          {totalSteps > 0 && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-80 max-w-md"
            >
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full"
                />

                {/* Shimmer effect */}
                <motion.div
                  animate={{
                    x: ["-100%", "200%"]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ width: "50%" }}
                />
              </div>

              {/* Progress text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500"
              >
                <span className="font-medium">{Math.round(progress)}%</span>
                <span>•</span>
                <span>{generatedSteps} of {totalSteps} complete</span>
              </motion.div>
            </motion.div>
          )}

          {/* Indeterminate state - no progress bar */}
          {totalSteps === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-gray-500"
            >
              Preparing your content...
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KnowledgeNuggetLoading;
