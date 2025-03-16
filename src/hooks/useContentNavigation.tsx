
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
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    // Show initial loading state for at least 3 seconds
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const storedTopic = sessionStorage.getItem("learn-topic");
    const storedPathId = sessionStorage.getItem("learning-path-id");

    console.log("Content navigation - stored values:", { storedTopic, storedPathId });

    if (!storedTopic || !storedPathId) {
      navigate("/projects");
      toast.error("Learning session not found. Please start a new learning path.");
      return;
    }

    setTopic(storedTopic);
    setPathId(storedPathId);
  }, [navigate, user]);

  const {
    steps,
    isLoading,
    markStepAsComplete,
    generatingContent: bgGenerating,
    generatedSteps: bgGenerated,
  } = useLearningSteps(pathId, topic);

  // Update generation status from useLearningSteps
  useEffect(() => {
    setGeneratingContent(bgGenerating);
    setGeneratedSteps(bgGenerated);
  }, [bgGenerating, bgGenerated]);

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
    isLoading: isLoading || initialLoading, // Include initial loading state
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
