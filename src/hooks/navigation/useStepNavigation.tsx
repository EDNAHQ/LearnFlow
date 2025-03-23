
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useStepNavigation(pathId: string | null, steps: any[]) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const navigationInitiated = useRef<boolean>(false);

  // Set initial step from URL parameter - called externally with stepId
  const initializeStep = useCallback((stepId: string | null) => {
    if (stepId && !navigationInitiated.current) {
      const stepIndex = parseInt(stepId, 10);
      if (!isNaN(stepIndex) && stepIndex >= 0) {
        setCurrentStep(stepIndex);
        navigationInitiated.current = true;
      }
    }
  }, []);

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

  // Handle completion of a step
  const handleMarkComplete = useCallback(async (markStepAsComplete: (id: string) => Promise<boolean>) => {
    if (!steps[currentStep]) return;
    
    const success = await markStepAsComplete(steps[currentStep].id);
    
    if (success && currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Update URL with the new step
      navigate(`/content/${pathId}/step/${nextStep}`, { replace: true });
      
      // Scroll to top immediately without animation
      window.scrollTo(0, 0);
      topRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [currentStep, steps, navigate, pathId]);

  // Handle back navigation
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

  // Navigate to projects page
  const goToProjects = useCallback(() => {
    navigate("/projects");
  }, [navigate]);

  return {
    currentStep,
    topRef,
    handleMarkComplete,
    handleBack,
    goToProjects,
    navigateToStep,
    initializeStep,
    isLastStep: steps.length > 0 ? currentStep === steps.length - 1 : false
  };
}
