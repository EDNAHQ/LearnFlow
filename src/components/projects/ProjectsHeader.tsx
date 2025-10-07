
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const ProjectsHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8 sm:mb-10 md:mb-12 text-center relative px-4"
    >
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 z-0"></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
      
      <div className="relative">
        <div className="inline-flex justify-center items-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center border border-brand-purple/30">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-brand-purple" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">Your Learning Projects</h1>
        <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base">
          Review and continue your learning journey
        </p>
      </div>
    </motion.div>
  );
};

export default ProjectsHeader;
