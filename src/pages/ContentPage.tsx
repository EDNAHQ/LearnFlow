import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useContentMode } from "@/hooks/useContentMode";
import ContentDisplay from "@/components/ContentDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import ContentProgress from "@/components/content/ContentProgress";
import ContentNavigation from "@/components/content/ContentNavigation";
import ContentLoading from "@/components/content/ContentLoading";
import ContentError from "@/components/content/ContentError";
import { useLearningSteps } from "@/hooks/useLearningSteps";
import { ModeToggle } from "@/components/ModeToggle";

const ContentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setMode } = useContentMode();
  const [topic, setTopic] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pathId, setPathId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [projectCompleted, setProjectCompleted] = useState<boolean>(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Set "text" (Read) mode by default when component mounts
  useEffect(() => {
    setMode("text");
  }, [setMode]);

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

  if (isLoading) {
    return <ContentLoading goToProjects={goToProjects} />;
  }

  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 w-full">
      <div ref={topRef}></div>
      
      <ContentHeader 
        onBack={handleBack}
        onHome={goToProjects}
        generatingContent={generatingContent}
        generatedSteps={generatedSteps}
        totalSteps={steps.length}
      />

      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-6 w-full">
            <ContentProgress 
              topic={topic} 
              currentStep={currentStep} 
              totalSteps={steps.length} 
            />
            {/* ModeToggle removed from here as requested */}
          </div>

          <div className="mb-6 w-full max-w-[860px] mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800 w-full max-w-[860px]">
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
  );
};

export default ContentPage;
