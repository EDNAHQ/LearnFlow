
import { useState, useEffect, useRef, useCallback } from "react";
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
  const navigationInitiated = useRef<boolean>(false);

  // User authentication and path validation
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

    // Get the topic from sessionStorage initially
    const storedTopic = sessionStorage.getItem("learn-topic");
    
    if (!storedTopic) {
      navigate("/projects");
      toast.error("Learning topic not found. Please start a new learning path.");
      return;
    }

    setTopic(storedTopic);
  }, [navigate, user, pathId]);

  // Set step from URL parameter if available - only run once to prevent loops
  useEffect(() => {
    if (stepId && !navigationInitiated.current) {
      const stepIndex = parseInt(stepId, 10);
      if (!isNaN(stepIndex) && stepIndex >= 0) {
        setCurrentStep(stepIndex);
        navigationInitiated.current = true;
      }
    }
  }, [stepId]);

  // Get learning steps data
  const {
    steps,
    isLoading: stepsLoading,
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

  // Update generation status from useLearningSteps - use minimal state updates
  useEffect(() => {
    if (steps.length > 0) {
      setGeneratingContent(bgGenerating);
      setGeneratedSteps(bgGenerated);
      
      // Only set initialLoading to false when content generation is complete or after a timeout
      if (!bgGenerating && steps.length > 0 && bgGenerated >= steps.length) {
        setInitialLoading(false);
      }
    }
  }, [bgGenerating, bgGenerated, steps.length]);

  // Add a timeout to eventually disable initial loading after 15 seconds
  // This is a safety measure in case content generation takes too long
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        if (initialLoading && steps.length > 0 && bgGenerated > 0) {
          console.log("Loading timeout reached, ending loading state despite incomplete generation");
          setInitialLoading(false);
        }
      }, 15000); // 15 second timeout - reduced from 30s to prevent long waits
      
      return () => clearTimeout(timer);
    }
  }, [initialLoading, steps.length, bgGenerated]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleMarkComplete = useCallback(async () => {
    if (!steps[currentStep]) return;
    
    const success = await markStepAsComplete(steps[currentStep].id);
    
    if (success && currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Update URL with the new step
      navigate(`/content/${pathId}/step/${nextStep}`, { replace: true });
      
      // Scroll to top
      window.scrollTo(0, 0);
      topRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [currentStep, steps, markStepAsComplete, navigate, pathId]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Update URL with the previous step, using replace to avoid building history stack
      navigate(`/content/${pathId}/step/${prevStep}`, { replace: true });
      
      // Scroll to top immediately without animation
      window.scrollTo(0, 0);
      topRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      navigate("/projects");
    }
  }, [currentStep, navigate, pathId]);

  // Navigate to a specific step
  const navigateToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      
      // Use replace: true to prevent history stack buildup
      navigate(`/content/${pathId}/step/${stepIndex}`, { replace: true });
      
      // Scroll to top immediately without animation
      window.scrollTo(0, 0);
      topRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [navigate, pathId, steps.length]);

  const goToProjects = useCallback(() => {
    navigate("/projects");
  }, [navigate]);

  const isLastStep = steps.length > 0 ? currentStep === steps.length - 1 : false;
  const currentStepData = steps[currentStep];

  return {
    topic,
    currentStep,
    pathId: pathId || null,
    steps,
    isLoading: stepsLoading || initialLoading,
    generatingContent,
    generatedSteps,
    handleMarkComplete,
    handleBack,
    goToProjects,
    isLastStep,
    currentStepData,
    topRef,
    navigateToStep
  };
};
