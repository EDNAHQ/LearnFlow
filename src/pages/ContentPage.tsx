
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ContentSection from "@/components/ContentSection";
import { Step } from "@/components/LearningStep";
import { generateStepContent } from "@/utils/learningUtils";
import { ArrowLeft, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ContentPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [contents, setContents] = useState<Record<number, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Retrieve data from sessionStorage
    const storedTopic = sessionStorage.getItem("learn-topic");
    const storedSteps = sessionStorage.getItem("learning-steps");
    
    if (!storedTopic || !storedSteps) {
      navigate("/");
      return;
    }
    
    setTopic(storedTopic);
    setSteps(JSON.parse(storedSteps));
    
    // Generate content for the first step
    const generateInitialContent = async () => {
      try {
        const parsedSteps: Step[] = JSON.parse(storedSteps);
        if (parsedSteps.length > 0) {
          const content = await generateStepContent(parsedSteps[0], storedTopic);
          setContents({ 1: content });
        }
      } catch (error) {
        toast.error("Failed to generate content. Please try again.");
        console.error("Error generating content:", error);
      } finally {
        setLoading(false);
      }
    };
    
    generateInitialContent();
  }, [navigate]);

  useEffect(() => {
    // Generate content for the current step if it doesn't exist
    const fetchStepContent = async () => {
      const step = steps[currentStep];
      if (step && !contents[step.id]) {
        setLoading(true);
        try {
          const content = await generateStepContent(step, topic);
          setContents(prev => ({ ...prev, [step.id]: content }));
        } catch (error) {
          toast.error("Failed to load content for this step.");
          console.error("Error generating step content:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchStepContent();
  }, [currentStep, steps, contents, topic]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGoHome = () => {
    navigate("/");
    sessionStorage.removeItem("learn-topic");
    sessionStorage.removeItem("learning-steps");
  };

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
              <p className="text-muted-foreground">Loading content...</p>
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
