
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ContentSection from "@/components/ContentSection";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle, Loader2 } from "lucide-react";

interface LearningStepData {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  detailed_content?: string | null;
}

const ContentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<string | null>(null);
  const [steps, setSteps] = useState<LearningStepData[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pathId, setPathId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [projectCompleted, setProjectCompleted] = useState<boolean>(false);
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const storedTopic = sessionStorage.getItem("learn-topic");
    const storedPathId = sessionStorage.getItem("learning-path-id");

    if (!storedTopic || !storedPathId) {
      navigate("/projects");
      return;
    }

    setTopic(storedTopic);
    setPathId(storedPathId);

    // Initial fetch of learning steps
    const fetchLearningSteps = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('learning_steps')
          .select('*')
          .eq('path_id', storedPathId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error("Error fetching learning steps:", error);
          toast.error("Failed to load learning steps");
          return;
        }

        if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} learning steps for path:`, storedPathId);
          setSteps(data);
          
          // Count how many steps already have content
          const stepsWithContent = data.filter(step => step.detailed_content).length;
          setGeneratedSteps(stepsWithContent);
          
          // If not all steps have content, show generation in progress
          if (stepsWithContent < data.length) {
            setGeneratingContent(true);
            
            // Single notification for generation progress
            toast.info(`Generating detailed content for your learning path (${stepsWithContent}/${data.length} steps completed)`, {
              duration: 5000,
              id: "content-generation-toast"
            });
          }
        } else {
          console.log("No learning steps found for path:", storedPathId);
          toast.info("No learning steps found for this project.");
        }
      } catch (error) {
        console.error("Error fetching learning steps:", error);
        toast.error("Failed to load learning steps");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningSteps();
    
    // Set up interval to check for content generation progress
    const checkContentGenerationProgress = setInterval(async () => {
      if (storedPathId && generatingContent) {
        try {
          const { data, error } = await supabase
            .from('learning_steps')
            .select('id, detailed_content')
            .eq('path_id', storedPathId);
            
          if (!error && data) {
            const stepsWithContent = data.filter(step => step.detailed_content).length;
            
            if (stepsWithContent !== generatedSteps) {
              setGeneratedSteps(stepsWithContent);
              
              // Update steps with new content
              setSteps(prevSteps => {
                const updatedSteps = [...prevSteps];
                data.forEach(newData => {
                  const index = updatedSteps.findIndex(step => step.id === newData.id);
                  if (index !== -1 && newData.detailed_content) {
                    updatedSteps[index].detailed_content = newData.detailed_content;
                  }
                });
                return updatedSteps;
              });
              
              // Update toast with current progress
              toast.info(`Generating content (${stepsWithContent}/${steps.length} steps completed)`, {
                duration: 5000,
                id: "content-generation-toast"
              });
              
              // If all content is generated, stop checking
              if (stepsWithContent === steps.length) {
                setGeneratingContent(false);
                toast.success("All learning content has been generated!", {
                  id: "content-generation-complete"
                });
              }
            }
          }
        } catch (error) {
          console.error("Error checking content generation status:", error);
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkContentGenerationProgress);
  }, [navigate, user, steps.length, generatingContent, generatedSteps]);

  const markStepAsComplete = useCallback(async (stepId: string) => {
    try {
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        )
      );

      const { error } = await supabase
        .from('learning_steps')
        .update({ completed: true })
        .eq('id', stepId);

      if (error) {
        console.error("Error marking step as complete:", error);
        toast.error("Failed to mark step as complete. Please try again.");

        setSteps(prevSteps =>
          prevSteps.map(step =>
            step.id === stepId ? { ...step, completed: false } : step
          )
        );
      } else {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    } catch (error) {
      console.error("Error marking step as complete:", error);
      toast.error("Failed to mark step as complete. Please try again.");
    }
  }, [currentStep, steps, setSteps]);

  const completePath = async () => {
    if (!pathId) return;
    
    try {
      setIsSubmitting(true);
      
      try {
        const { error: updateError } = await supabase
          .from('learning_paths')
          .update({ is_approved: true })
          .eq('id', pathId);
        
        if (updateError) {
          console.error("Error updating path:", updateError);
        }
      } catch (error) {
        console.error("Error updating path:", error);
      }
      
      toast.success("Congratulations! Learning project completed! 🎉");
      setProjectCompleted(true);
      setCurrentStep(steps.length);
    } catch (error) {
      console.error("Error marking project as complete:", error);
      toast.error("Failed to mark project as complete");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/projects");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-learn-500" />
        <p className="text-lg">Loading learning steps...</p>
      </div>
    );
  }

  if (!topic || !pathId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
        <BookOpen className="w-12 h-12 mb-4 text-learn-500" />
        <p className="text-xl font-semibold mb-2">
          Oops! It seems like we couldn't retrieve the learning topic.
        </p>
        <p className="text-gray-500 mb-6">
          Please go back to the projects page and try again.
        </p>
        <Button onClick={() => navigate("/projects")} className="bg-learn-600 hover:bg-learn-700">
          Go to Projects
        </Button>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-gray-800"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-800">LearnFlow</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">{topic}</h1>
            <div className="flex justify-between items-center">
              <p className="text-gray-500">
                Follow the steps below to complete your learning journey
              </p>
              
              {generatingContent && (
                <div className="flex items-center gap-2 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Generating content ({generatedSteps}/{steps.length})</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Step {currentStep + 1}: {currentStepData?.title}
              </h2>
              <div className="text-sm text-gray-500">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
            <ContentSection 
              title={currentStepData?.title || ""}
              content={currentStepData?.id + ":" + (currentStepData?.content || "No content available for this step.")}
              index={currentStep}
              detailedContent={currentStepData?.detailed_content}
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                className="bg-learn-600 hover:bg-learn-700 text-white"
                onClick={() => markStepAsComplete(currentStepData.id)}
              >
                Mark Complete & Next
              </Button>
            ) : (
              <Button
                className={`bg-green-600 hover:bg-green-700 text-white ${projectCompleted ? 'cursor-not-allowed' : ''}`}
                onClick={completePath}
                disabled={isSubmitting || projectCompleted}
              >
                {isSubmitting ? (
                  <>
                    Submitting...
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  </>
                ) : projectCompleted ? (
                  <>
                    Completed <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Complete Project"
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContentPage;
