
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ContentSection from "@/components/ContentSection";
import { Step } from "@/components/LearningStep";
import { generateStepContent } from "@/utils/learningUtils";
import { ArrowLeft, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { UserNav } from "@/components/UserNav";

const ContentPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const [pathId, setPathId] = useState<string | null>(null);
  const [preloadingComplete, setPreloadingComplete] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Fetch all steps for the learning path
  useEffect(() => {
    // Retrieve data from sessionStorage
    const storedTopic = sessionStorage.getItem("learn-topic");
    const storedPathId = sessionStorage.getItem("learning-path-id");
    
    if (!storedTopic || !storedPathId) {
      navigate("/");
      return;
    }
    
    setTopic(storedTopic);
    setPathId(storedPathId);
    
    // Fetch all steps for this path from Supabase
    const fetchSteps = async () => {
      try {
        const { data, error } = await supabase
          .from('learning_steps')
          .select('id, title, content, detailed_content, order_index')
          .eq('path_id', storedPathId)
          .order('order_index');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform the data to match the Step interface
          const fetchedSteps: Step[] = data.map(step => ({
            id: step.id,
            title: step.title,
            description: step.content || ""
          }));
          
          setSteps(fetchedSteps);
          
          // Initialize contents with any existing detailed_content
          const initialContents: Record<string, string> = {};
          data.forEach(step => {
            if (step.detailed_content) {
              initialContents[step.id] = step.detailed_content;
            }
          });
          
          setContents(initialContents);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching steps:", error);
        toast.error("Failed to load your learning content.");
        setLoading(false);
      }
    };
    
    fetchSteps();
  }, [navigate]);

  // Generate content for the current step if not already loaded
  useEffect(() => {
    // Only fetch current step content if not preloading
    if (steps.length > 0 && !preloadingComplete) {
      const currentStepData = steps[currentStep];
      if (currentStepData && !contents[currentStepData.id]) {
        setLoading(true);
        generateStepContent(currentStepData, topic)
          .then(content => {
            setContents(prev => ({ ...prev, [currentStepData.id]: content }));
            markStepAsCompleted(currentStepData.id);
            setLoading(false);
          })
          .catch(error => {
            console.error("Error generating content:", error);
            toast.error("Failed to load content for this step.");
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, [currentStep, steps, contents, topic, preloadingComplete]);

  // Mark a step as completed in the database
  const markStepAsCompleted = async (stepId: string) => {
    try {
      await supabase
        .from('learning_steps')
        .update({ completed: true })
        .eq('id', stepId);
    } catch (error) {
      console.error("Error marking step as completed:", error);
    }
  };

  // Preload all content in the background
  useEffect(() => {
    if (steps.length > 0 && !preloadingComplete) {
      const preloadContent = async () => {
        toast.info("Preparing your learning content in the background...");
        
        const missingContentSteps = steps.filter(step => !contents[step.id]);
        if (missingContentSteps.length === 0) {
          setPreloadingComplete(true);
          toast.success("All content is ready!");
          return;
        }
        
        // Process steps one by one in the background
        for (let i = 0; i < missingContentSteps.length; i++) {
          const step = missingContentSteps[i];
          setLoadingStep(step.order_index);
          
          try {
            // Don't show toast for each step to avoid notification spam
            const content = await generateStepContent(step, topic);
            setContents(prev => ({ ...prev, [step.id]: content }));
            markStepAsCompleted(step.id);
            
            // Update progress
            const progress = Math.round(((i + 1) / missingContentSteps.length) * 100);
            setLoadingProgress(progress);
          } catch (error) {
            console.error(`Error generating content for step ${i + 1}:`, error);
            // Continue with other steps even if one fails
          }
        }
        
        setLoadingStep(null);
        setPreloadingComplete(true);
        toast.success("All learning content has been loaded!");
      };
      
      // Start preloading after a short delay to allow the first content to load
      const timer = setTimeout(() => {
        if (!preloadingComplete) {
          preloadContent();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [steps, contents, topic, preloadingComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleGoHome = useCallback(() => {
    navigate("/");
    sessionStorage.removeItem("learn-topic");
    sessionStorage.removeItem("learning-path-id");
  }, [navigate]);

  if (steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">No learning plan found.</p>
          <Button onClick={handleGoHome}>Go Home</Button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 md:px-6">
      <div className="absolute top-4 right-4">
        <UserNav />
      </div>
      
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button 
            variant="ghost" 
            className="flex items-center gap-1" 
            onClick={() => navigate("/plan")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Plan</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleGoHome}
            title="Go to home"
          >
            <Home className="h-4 w-4" />
          </Button>
        </motion.div>

        <div className="mb-8 text-center">
          <motion.p 
            className="text-sm text-muted-foreground mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Learning journey for <span className="font-medium text-foreground">{topic}</span>
          </motion.p>
          <motion.div 
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold">
              Step {currentStep + 1} of {steps.length}
            </h1>
          </motion.div>
          
          <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
            <motion.div 
              className="h-full bg-learn-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {loadingStep !== null && !preloadingComplete && (
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between mb-1">
                <span>Loading content in background</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-learn-200 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-10 h-10 rounded-full border-4 border-learn-200 border-t-learn-500 animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading content for this step...</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStepData.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData && contents[currentStepData.id] && (
                <ContentSection 
                  title={currentStepData.title}
                  content={contents[currentStepData.id]}
                  index={currentStep}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-white/80 backdrop-blur-md border-t border-gray-100"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm font-medium">
              {currentStep + 1} of {steps.length}
            </span>
            
            <Button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="gap-1 bg-learn-600 hover:bg-learn-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContentPage;
