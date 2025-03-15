
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLearningSteps } from "@/hooks/useLearningSteps";
import { supabase } from "@/integrations/supabase/client";

export const useContentNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pathId, setPathId] = useState<string | null>(null);
  const [pathTitle, setPathTitle] = useState<string | null>(null);
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);
  const topRef = useRef<HTMLDivElement>(null);

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
    
    // Fetch the path title if available
    const fetchPathTitle = async () => {
      if (storedPathId) {
        try {
          const { data, error } = await supabase
            .from('learning_paths')
            .select('title')
            .eq('id', storedPathId)
            .single();
            
          if (!error && data && data.title) {
            setPathTitle(data.title);
          }
        } catch (error) {
          console.error("Error fetching path title:", error);
        }
      }
    };
    
    fetchPathTitle();
  }, [navigate, user]);

  const {
    steps,
    isLoading,
    markStepAsComplete,
    setSteps
  } = useLearningSteps(pathId, topic);

  // Check if steps have content
  useEffect(() => {
    if (steps.length > 0) {
      const stepsWithContent = steps.filter(step => step.detailed_content).length;
      setGeneratedSteps(stepsWithContent);
      setGeneratingContent(stepsWithContent < steps.length);
    }
  }, [steps]);

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

  const isLastStep = steps.length > 0 ? currentStep === steps.length - 1 : false;
  const currentStepData = steps[currentStep];

  return {
    topic,
    pathTitle,
    currentStep,
    pathId,
    steps,
    isLoading,
    generatingContent,
    generatedSteps,
    handleMarkComplete,
    handleBack,
    goToProjects,
    isLastStep,
    currentStepData,
    topRef,
    setSteps
  };
};
