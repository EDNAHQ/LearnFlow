import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLearningSteps } from "@/hooks/useLearningSteps";
import { startBackgroundContentGeneration } from "@/utils/learning/backgroundContentGeneration";
import { Step } from "@/components/LearningStep";

export const useContentNavigation = () => {
  const navigate = useNavigate();
  const { pathId, stepId } = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
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

    if (!pathId) {
      navigate("/projects");
      toast.error("Learning path not found. Please select a project.");
      return;
    }

    // We still need to get the topic from sessionStorage initially
    // In a more complete solution, we would fetch this from the database based on pathId
    const storedTopic = sessionStorage.getItem("learn-topic");
    
    if (!storedTopic) {
      // Fetch topic based on pathId from database
      // For now, we'll keep using sessionStorage as a fallback
      navigate("/projects");
      toast.error("Learning topic not found. Please start a new learning path.");
      return;
    }

    setTopic(storedTopic);
  }, [navigate, user, pathId]);

  // Set step from URL parameter if available
  useEffect(() => {
    if (stepId) {
      const stepIndex = parseInt(stepId, 10);
      if (!isNaN(stepIndex) && stepIndex >= 0) {
        setCurrentStep(stepIndex);
      }
    }
  }, [stepId]);

  const {
    steps,
    isLoading,
    markStepAsComplete,
    generatingContent: bgGenerating,
    generatedSteps: bgGenerated,
  } = useLearningSteps(pathId || null, topic);

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
    if (steps.length > 0) {
      setGeneratingContent(bgGenerating);
      setGeneratedSteps(bgGenerated);
      
      console.log(`Content generation status updated: ${bgGenerated}/${steps.length} steps, generating: ${bgGenerating}`);
      
      // Only set initialLoading to false when content generation is complete or after a timeout
      if (!bgGenerating && steps.length > 0 && bgGenerated >= steps.length) {
        console.log("All content generated, ending loading state");
        setInitialLoading(false);
      }
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
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Update URL with the new step
      navigate(`/content/${pathId}/step/${nextStep}`);
      
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Update URL with the previous step
      navigate(`/content/${pathId}/step/${prevStep}`);
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
    pathId: pathId || null,
    steps,
    isLoading: isLoading || initialLoading,
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
