
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LearningStepData {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  detailed_content?: string | null;
  order_index?: number;
}

export const useLearningSteps = (pathId: string | null, topic: string | null) => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<LearningStepData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);

  useEffect(() => {
    if (!pathId) return;

    const fetchLearningSteps = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('learning_steps')
          .select('*')
          .eq('path_id', pathId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error("Error fetching learning steps:", error);
          toast.error("Failed to load learning content");
          return;
        }

        if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} learning steps for path:`, pathId);
          
          // Process data to ensure all values are properly formatted as strings
          const processedData = data.map(step => ({
            ...step,
            content: typeof step.content === 'string' 
              ? step.content 
              : (step.content ? JSON.stringify(step.content) : "No content available"),
            detailed_content: typeof step.detailed_content === 'string'
              ? step.detailed_content
              : (step.detailed_content ? JSON.stringify(step.detailed_content) : null)
          }));
          
          setSteps(processedData);
          
          // Check for background generation status
          const stepsWithoutContent = processedData.filter(step => !step.detailed_content).length;
          setGeneratedSteps(processedData.length - stepsWithoutContent);
          setGeneratingContent(stepsWithoutContent > 0);
        } else {
          console.log("No learning steps found for path:", pathId);
          toast.error("No learning content found");
        }
      } catch (error) {
        console.error("Error fetching learning steps:", error);
        toast.error("Failed to load learning content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningSteps();
    
    // Set up subscription to track generation progress
    const subscription = supabase
      .channel(`steps-${pathId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'learning_steps',
          filter: `path_id=eq.${pathId}`
        }, 
        (payload) => {
          console.log('Step updated:', payload);
          // Update only the changed step in the state
          setSteps(prevSteps => 
            prevSteps.map(step => 
              step.id === payload.new.id 
                ? {
                    ...step,
                    detailed_content: payload.new.detailed_content
                  }
                : step
            )
          );
          
          // Update generation progress
          setGeneratedSteps(prev => {
            const newValue = prev + 1;
            if (newValue >= steps.length) {
              setGeneratingContent(false);
            }
            return newValue;
          });
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [pathId, topic]);

  const markStepAsComplete = async (stepId: string) => {
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
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error marking step as complete:", error);
      toast.error("Failed to mark step as complete. Please try again.");
      return false;
    }
  };

  return {
    steps,
    isLoading,
    generatingContent,
    generatedSteps,
    markStepAsComplete,
    setSteps
  };
};
