
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LoadingAnimation from "./nuggets/LoadingAnimation";
import NuggetCard from "./nuggets/NuggetCard";
import NuggetIndicators from "./nuggets/NuggetIndicators";
import ProgressIndicator from "./nuggets/ProgressIndicator";
import NuggetsFetcher from "./nuggets/NuggetsFetcher";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [nuggets, setNuggets] = useState<string[]>([]);
  const [currentNuggetIndex, setCurrentNuggetIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

  // Auto-redirect to first content page when generation is complete
  useEffect(() => {
    if (!generatingContent && pathId && totalSteps > 0 && generatedSteps >= totalSteps) {
      console.log("Content generation complete. Navigating to first content page...");
      // Navigate to the first step (index 0) of the content
      navigate(`/content/${pathId}/step/0`);
    }
  }, [generatingContent, generatedSteps, totalSteps, pathId, navigate]);

  useEffect(() => {
    // Auto-rotate through nuggets - exactly 8 seconds per nugget
    if (nuggets.length > 0) {
      const timer = setTimeout(() => {
        setCurrentNuggetIndex(prev => (prev + 1) % nuggets.length);
      }, 8000); // Exactly 8 seconds per nugget
      
      return () => clearTimeout(timer);
    }
  }, [nuggets]); // Removed currentNuggetIndex as dependency to prevent timer resets

  // Function to manually navigate nuggets
  const goToNugget = (index: number) => {
    setCurrentNuggetIndex(index);
  };

  // Handlers for NuggetsFetcher
  const handleNuggetsLoaded = (loadedNuggets: string[]) => {
    setNuggets(loadedNuggets);
  };

  const handleFetchError = (errorMessage: string) => {
    setError(errorMessage);
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
              Crafting your {topic} learning journey
            </motion.span>
          </h2>
          
          <p className="text-gray-600 text-center mb-6">
            We're creating personalized content for you. In the meantime, enjoy these insights:
          </p>

          <ProgressIndicator 
            progress={progress} 
            generatingContent={generatingContent}
            generatedSteps={generatedSteps}
            totalSteps={totalSteps}
          />

          {/* Non-visual component that fetches nuggets */}
          <NuggetsFetcher 
            topic={topic} 
            onNuggetsLoaded={handleNuggetsLoaded}
            onError={handleFetchError}
          />

          <div className="w-full min-h-[200px] mb-6 flex items-center justify-center py-4">
            {nuggets.length > 0 && (
              <NuggetCard 
                nugget={nuggets[currentNuggetIndex]} 
                iconIndex={currentNuggetIndex}
              />
            )}
          </div>

          <NuggetIndicators 
            nuggets={nuggets}
            currentIndex={currentNuggetIndex}
            onSelectNugget={goToNugget}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
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
