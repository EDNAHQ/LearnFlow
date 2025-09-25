
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LoadingAnimation from "../nuggets/LoadingAnimation";
import ProgressIndicator from "../nuggets/ProgressIndicator";

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

  // Set progress based purely on content generation count
  useEffect(() => {
    if (totalSteps > 0) {
      const calculatedProgress = Math.min(
        Math.max((generatedSteps / totalSteps) * 100, 0),
        100
      );
      setProgress(calculatedProgress);
    }
  }, [generatedSteps, totalSteps]);

  // In indeterminate mode (totalSteps === 0), let the ProgressIndicator render a smooth animation

  // Format the topic to display nicely
  const getFormattedTopic = () => {
    if (!topic) return "your learning journey";
    
    // Remove any leading/trailing whitespace and ensure first character is lowercase
    // so it fits grammatically in the "Crafting your [topic]" phrase
    let formattedTopic = topic.trim();
    if (formattedTopic.length > 0) {
      formattedTopic = formattedTopic.charAt(0).toLowerCase() + formattedTopic.slice(1);
    }
    
    return formattedTopic;
  };

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
              Crafting your {getFormattedTopic()} learning journey
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
              variant="brand"
            >
              Back to Projects
            </Button>
          </motion.div>
          
          {/* Added more informative text about what's happening */}
          {generatingContent && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="mt-4 text-sm text-gray-500 max-w-md text-center"
            >
              Our AI is generating concise, personalized content for each step of your learning path. 
              This process can take a few moments as we craft high-quality material just for you.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeNuggetLoading;
