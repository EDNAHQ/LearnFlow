
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LoadingAnimation from "./nuggets/LoadingAnimation";
import ProgressIndicator from "./nuggets/ProgressIndicator";

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

  // Set progress based on content generation
  useEffect(() => {
    if (totalSteps > 0) {
      const calculatedProgress = (generatedSteps / totalSteps) * 100;
      setProgress(calculatedProgress);
    }
  }, [generatedSteps, totalSteps]);

  // Fallback progress animation when steps aren't available
  useEffect(() => {
    if (generatingContent && totalSteps === 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          // Slowly increase but never reach 100% until generation is complete
          const increment = (100 - prev) * 0.01;
          const newProgress = prev + (increment < 0.5 ? 0.5 : increment);
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [generatingContent, totalSteps]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-6">
      <div className="max-w-3xl w-full">
        <div className="flex flex-col items-center mb-8">
          <LoadingAnimation />
          
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Crafting your {topic} learning journey
            </motion.span>
          </h2>
          
          <p className="text-gray-600 text-center mb-6">
            We're creating personalized content for you.
          </p>

          <ProgressIndicator 
            progress={progress}
            generatingContent={generatingContent}
            generatedSteps={generatedSteps}
            totalSteps={totalSteps}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <Button 
              onClick={goToProjects} 
              className="bg-[#6D42EF] hover:bg-[#5835CB] text-white"
            >
              Back to Projects
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeNuggetLoading;
