
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLearningSteps } from "@/hooks/useLearningSteps";

export const useContentNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pathId, setPathId] = useState<string | null>(null);
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
  }, [navigate, user]);

  const {
    steps,
    isLoading,
    markStepAsComplete,
  } = useLearningSteps(pathId, topic);

  // Check if background generation is happening
  useEffect(() => {
    if (steps.length > 0) {
      const stepsWithoutContent = steps.filter(step => !step.detailed_content).length;
      setGeneratedSteps(steps.length - stepsWithoutContent);
      setGeneratingContent(stepsWithoutContent > 0);
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
    topRef
  };
};
