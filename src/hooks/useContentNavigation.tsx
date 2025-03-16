
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLearningSteps } from "@/hooks/useLearningSteps";
import { startBackgroundContentGeneration } from "@/utils/learning/backgroundContentGeneration";
import { Step } from "@/components/LearningStep";

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
  const contentGenerationStarted = useRef<boolean>(false);

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

  // Start background content generation when steps are loaded
  useEffect(() => {
    if (steps.length > 0 && pathId && topic && !contentGenerationStarted.current) {
      console.log(`Starting background content generation for ${steps.length} steps`);
      setGeneratingContent(true);
      contentGenerationStarted.current = true;
      
      // Map the learning step data to match the Step interface
      const stepsForGeneration: Step[] = steps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.content || "" // Use content as description
      }));
      
      // Start background generation for all steps
      startBackgroundContentGeneration(stepsForGeneration, topic, pathId)
        .catch(err => {
          console.error("Error starting background generation:", err);
        });
    }
  }, [steps, pathId, topic]);

  // Update generation status from useLearningSteps
  useEffect(() => {
    setGeneratingContent(bgGenerating);
    setGeneratedSteps(bgGenerated);
    
    console.log(`Content generation status updated: ${bgGenerated}/${steps.length} steps, generating: ${bgGenerating}`);
    
    // Only set initialLoading to false when content generation is complete or after a timeout
    if (!bgGenerating && steps.length > 0 && bgGenerated >= steps.length) {
      console.log("All content generated, ending loading state");
      setInitialLoading(false);
    }
  }, [bgGenerating, bgGenerated, steps.length]);

  // Add a timeout to eventually disable initial loading after 30 seconds
  // This is a safety measure in case content generation takes too long
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        if (initialLoading && steps.length > 0 && bgGenerated > 0) {
          console.log("Loading timeout reached, ending loading state despite incomplete generation");
          setInitialLoading(false);
        }
      }, 30000); // 30 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [initialLoading, steps.length, bgGenerated]);

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
