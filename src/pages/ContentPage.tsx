
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { ContentModeProvider } from "@/hooks/useContentMode";
import ContentDisplay from "@/components/ContentDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import ContentProgress from "@/components/content/ContentProgress";
import ContentNavigation from "@/components/content/ContentNavigation";
import ContentLoading from "@/components/content/ContentLoading";
import ContentError from "@/components/content/ContentError";
import { useLearningSteps, LearningStepData } from "@/hooks/useLearningSteps";

const ContentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pathId, setPathId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [projectCompleted, setProjectCompleted] = useState<boolean>(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Get stored data from session
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
  }, [navigate, user]);

  // Use custom hook to manage learning steps
  const {
    steps,
    isLoading,
    generatingContent,
    generatedSteps,
    markStepAsComplete,
  } = useLearningSteps(pathId, topic);

  const handleMarkComplete = async () => {
    if (!steps[currentStep]) return;
    
    const success = await markStepAsComplete(steps[currentStep].id);
    
    if (success && currentStep < steps.length - 1) {
      setCurrentStep(prev => {
        setTimeout(() => {
          topRef.current?.scrollIntoView({ behavior: 'smooth' });
          window.scrollTo(0, 0);
        }, 100);
        return prev + 1;
      });
    }
  };

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
      
      setTimeout(() => {
        navigate("/projects");
      }, 2000);
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

  const goToProjects = () => {
    navigate("/projects");
  };

  // Loading state
  if (isLoading) {
    return <ContentLoading />;
  }

  // Error state
  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  return (
    <ContentModeProvider>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <div ref={topRef}></div>
        
        <ContentHeader 
          onBack={handleBack}
          onHome={goToProjects}
          generatingContent={generatingContent}
          generatedSteps={generatedSteps}
          totalSteps={steps.length}
        />

        <div className="container max-w-4xl mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ContentProgress 
              topic={topic} 
              currentStep={currentStep} 
              totalSteps={steps.length} 
            />

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentStepData?.title}
                </h2>
              </div>
              <ContentDisplay 
                title={currentStepData?.title || ""}
                content={currentStepData?.id + ":" + (currentStepData?.content || "No content available for this step.")}
                index={currentStep}
                detailedContent={currentStepData?.detailed_content}
                pathId={pathId}
                topic={topic}
              />
            </div>

            <ContentNavigation 
              currentStep={currentStep}
              totalSteps={steps.length}
              onPrevious={handleBack}
              onComplete={handleComplete}
              isLastStep={isLastStep}
              isSubmitting={isSubmitting}
              projectCompleted={projectCompleted}
            />
          </motion.div>
        </div>

        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={goToProjects}
            className="bg-[#1A1A1A] text-white hover:bg-[#333333] shadow-md rounded-full p-3 h-auto"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </ContentModeProvider>
  );
};

export default ContentPage;
