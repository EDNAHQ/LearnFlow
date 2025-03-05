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
  }, [navigate, user]);

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-lg">Loading learning steps...</p>
      </div>
    );
  }

  if (!topic || !pathId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <BookOpen className="w-12 h-12 mb-4" />
        <p className="text-xl font-semibold mb-2">
          Oops! It seems like we couldn't retrieve the learning topic.
        </p>
        <p className="text-gray-400 mb-6">
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">LearnFlow</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{topic}</h1>
            <p className="text-gray-400">
              Follow the steps below to complete your learning journey
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">
                Step {currentStep + 1}: {currentStepData?.title}
              </h2>
              <div className="text-sm text-gray-400">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
            <ContentSection 
              title={currentStepData?.title || ""}
              content={currentStepData?.id + ":" + (currentStepData?.content || "No content available for this step.")}
              index={currentStep}
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-white"
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
