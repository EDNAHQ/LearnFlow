
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useCallback, memo } from "react";

interface Step {
  id: string;
  title: string;
}

interface ContentProgressProps {
  topic: string;
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  onNavigateToStep: (step: number) => void;
}

// Function to truncate text to a specific word count
const truncateByWords = (text: string, wordLimit: number = 10): string => {
  const words = text.trim().split(/\s+/);
  
  if (words.length <= wordLimit) {
    return text;
  }
  
  return words.slice(0, wordLimit).join(' ') + '...';
};

// Memoize the component to prevent unnecessary re-renders
const ContentProgress = memo(({
  topic,
  currentStep,
  totalSteps,
  steps = [], // Provide default empty array to prevent mapping errors
  onNavigateToStep
}: ContentProgressProps) => {
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  // Memoize the dialog close handler
  const handleStepSelect = useCallback((index: number) => {
    onNavigateToStep(index);
    setShowAllSteps(false);
  }, [onNavigateToStep]);
  
  // Truncate the topic text to 10 words
  const truncatedTopic = truncateByWords(topic);
  
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-4 gap-2"
      >
        <div className="flex items-center gap-3">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] bg-clip-text text-transparent truncate max-w-[400px]"
            title={topic}
          >
            {truncatedTopic}
          </motion.h1>

          <Dialog open={showAllSteps} onOpenChange={setShowAllSteps}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="text-[#6654f5] hover:bg-gradient-to-r hover:from-[#6654f5]/10 hover:to-[#ca5a8b]/10 rounded-xl transition-all duration-300 px-3 py-1 text-sm font-medium"
                  aria-label="Table of contents"
                >
                  View All
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-lg border border-gray-200">
              <div className="pt-4">
                <div className="mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] bg-clip-text text-transparent">
                    Learning Journey Steps
                  </h3>
                </div>
                <div className="space-y-3">
                  {steps && steps.length > 0 ? steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        currentStep === index
                          ? 'brand-gradient text-white shadow-lg shadow-[#6654f5]/20'
                          : 'bg-gray-50 hover:bg-gradient-to-r hover:from-[#6654f5]/5 hover:to-[#ca5a8b]/5 border border-gray-200 hover:border-[#6654f5]/30'
                      }`}
                      onClick={() => handleStepSelect(index)}
                    >
                      <div className="flex items-center">
                        <div className={`mr-4 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ${
                          currentStep === index
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-to-br from-[#6654f5]/10 to-[#ca5a8b]/10 text-[#6654f5]'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium flex-1">{step.title}</span>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="p-4 text-gray-500 text-center">No steps available</div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] rounded-full blur opacity-30"></div>
          <div className="relative bg-white text-sm py-2 rounded-full font-semibold px-5 border border-gray-100">
            <span className="bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] bg-clip-text text-transparent">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="relative">
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep + 1) / totalSteps * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full relative overflow-hidden"
          >
            <div className="absolute inset-0 brand-gradient" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20" />
          </motion.div>
        </div>
      </div>
    </div>
  );
});

// Add displayName for better debugging
ContentProgress.displayName = "ContentProgress";

export default ContentProgress;
