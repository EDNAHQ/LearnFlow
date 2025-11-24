import { motion } from "framer-motion";

const PlanLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-brand-pink to-brand-gold rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Animated LearnFlow logo */}
        <motion.div
          className="mb-6 sm:mb-8 flex flex-col items-center"
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
          <span className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight leading-tight pb-1">
            LearnFlow
          </span>
          <motion.span
            className="text-xs font-semibold text-gray-400 tracking-wide uppercase mt-2"
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

        {/* Loading message */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl font-medium text-brand-black text-center mb-2 px-4"
        >
          Crafting your personalized learning journey...
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm sm:text-base text-gray-600 text-center mb-6 px-4"
        >
          This may take up to 30 seconds
        </motion.p>

        {/* Animated dots loader */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }}
              className="w-3 h-3 bg-gradient-to-r from-brand-purple to-brand-pink rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PlanLoading;
