
import { useState, useEffect } from "react";
import { Loader2, Lightbulb, Brain, Sparkles, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface KnowledgeNuggetLoadingProps {
  topic: string | null;
  goToProjects: () => void;
  generatingContent?: boolean;
  generatedSteps?: number;
  totalSteps?: number;
}

const KnowledgeNuggetLoading = ({ 
  topic, 
  goToProjects,
  generatingContent = true,
  generatedSteps = 0,
  totalSteps = 10
}: KnowledgeNuggetLoadingProps) => {
  const [nuggets, setNuggets] = useState<string[]>([]);
  const [currentNuggetIndex, setCurrentNuggetIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [nuggetIcons] = useState([
    <Lightbulb className="w-6 h-6 mr-3 text-[#6D42EF] flex-shrink-0" />,
    <Brain className="w-6 h-6 mr-3 text-[#E84393] flex-shrink-0" />,
    <Sparkles className="w-6 h-6 mr-3 text-[#F5B623] flex-shrink-0" />,
    <BookOpen className="w-6 h-6 mr-3 text-[#6D42EF] flex-shrink-0" />,
    <Zap className="w-6 h-6 mr-3 text-[#E84393] flex-shrink-0" />
  ]);

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

  useEffect(() => {
    const fetchNuggets = async () => {
      if (!topic) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('generate-knowledge-nuggets', {
          body: { topic },
        });

        if (error) throw new Error(error.message);
        
        if (data && data.nuggets && data.nuggets.length > 0) {
          setNuggets(data.nuggets);
        } else {
          // Fallback nuggets if the API doesn't return any
          setNuggets([
            `Hooks let components "hook into" React's lifecycle and state without classes.`,
            `Custom hooks enable sharing stateful logic between components without duplication.`,
            `React's useState hook is implemented using a linked list data structure internally.`,
            `The dependency array in useEffect works similarly to a manual memoization technique.`,
            `React's rules of hooks prevent conditional hook execution for internal consistency.`,
            `The useReducer hook is inspired by Redux's state management pattern.`,
            `Hooks can reduce bundle size by enabling more efficient tree-shaking in builds.`,
            `The Context API combined with hooks offers an alternative to prop drilling.`,
            `React's internal fiber architecture was redesigned to support hooks efficiently.`,
            `Debugging hooks often requires special tools like React DevTools for deeper insight.`
          ]);
        }
      } catch (err) {
        console.error('Error fetching nuggets:', err);
        setError('Failed to load knowledge nuggets');
        // Set fallback nuggets
        setNuggets([
          `Hooks let components "hook into" React's lifecycle and state without classes.`,
          `Custom hooks enable sharing stateful logic between components without duplication.`,
          `React's useState hook is implemented using a linked list data structure internally.`,
          `The dependency array in useEffect works similarly to a manual memoization technique.`,
          `React's rules of hooks prevent conditional hook execution for internal consistency.`,
          `The useReducer hook is inspired by Redux's state management pattern.`,
          `Hooks can reduce bundle size by enabling more efficient tree-shaking in builds.`,
          `The Context API combined with hooks offers an alternative to prop drilling.`,
          `React's internal fiber architecture was redesigned to support hooks efficiently.`,
          `Debugging hooks often requires special tools like React DevTools for deeper insight.`
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNuggets();
  }, [topic]);

  useEffect(() => {
    // Auto-rotate through nuggets
    if (nuggets.length > 0) {
      const interval = setInterval(() => {
        setCurrentNuggetIndex(prev => (prev + 1) % nuggets.length);
      }, 6000); // Change every 6 seconds
      
      return () => clearInterval(interval);
    }
  }, [nuggets]);

  // Function to manually navigate nuggets
  const goToNugget = (index: number) => {
    setCurrentNuggetIndex(index);
  };
  
  // Format progress message
  const getProgressMessage = () => {
    if (!generatingContent && progress >= 100) {
      return "Content ready! You'll be redirected automatically.";
    }
    
    return `Generating content... ${Math.round(progress)}%`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-6">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
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

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#6D42EF] to-[#E84393]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="w-full h-[200px] mb-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNuggetIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <Card className="bg-white border border-gray-200 overflow-hidden shadow-md transform transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex">
                      {nuggetIcons[currentNuggetIndex % nuggetIcons.length]}
                      <p className="text-gray-800 text-lg">
                        {nuggets[currentNuggetIndex]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Enhanced nugget indicators with click navigation */}
          <div className="flex space-x-3 mb-6">
            {nuggets.map((_, index) => (
              <button
                key={index}
                onClick={() => goToNugget(index)}
                className={`h-3 transition-all ${
                  index === currentNuggetIndex 
                    ? 'w-6 bg-[#6D42EF] rounded-full' 
                    : 'w-3 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

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
          
          <p className="text-gray-600 text-sm mt-4">
            {getProgressMessage()}
          </p>
          
          {generatingContent && (
            <p className="text-gray-500 text-xs mt-2">
              Generated {generatedSteps} of {totalSteps} content pieces
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeNuggetLoading;
