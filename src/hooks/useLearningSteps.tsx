
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateStepContent } from "@/utils/learningUtils";

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
          return;
        }

        if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} learning steps for path:`, pathId);
          
          // Process step content to ensure it's always a string
          const processedData = data.map(step => ({
            ...step,
            content: typeof step.content === 'string' 
              ? step.content 
              : JSON.stringify(step.content)
          }));
          
          setSteps(processedData);
          
          const stepsWithContent = data.filter(step => step.detailed_content).length;
          setGeneratedSteps(stepsWithContent);
          
          if (stepsWithContent < data.length) {
            setGeneratingContent(true);
            
            // Quietly generate content without toast notifications
            data.forEach(step => {
              if (!step.detailed_content) {
                generateStepContent(
                  { id: step.id, title: step.title, description: typeof step.content === 'string' ? step.content : JSON.stringify(step.content) },
                  topic || "",
                  true // Silence notifications
                ).catch(err => {
                  console.error(`Error generating content for step ${step.id}:`, err);
                });
              }
            });
          }
        } else {
          console.log("No learning steps found for path:", pathId);
        }
      } catch (error) {
        console.error("Error fetching learning steps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningSteps();
    
    const checkContentGenerationProgress = setInterval(async () => {
      if (pathId && generatingContent) {
        try {
          const { data, error } = await supabase
            .from('learning_steps')
            .select('id, detailed_content')
            .eq('path_id', pathId);
            
          if (!error && data) {
            const stepsWithContent = data.filter(step => step.detailed_content).length;
            
            if (stepsWithContent !== generatedSteps) {
              setGeneratedSteps(stepsWithContent);
              
              setSteps(prevSteps => {
                const updatedSteps = [...prevSteps];
                data.forEach(newData => {
                  const index = updatedSteps.findIndex(step => step.id === newData.id);
                  if (index !== -1 && newData.detailed_content) {
                    updatedSteps[index].detailed_content = newData.detailed_content;
                  }
                });
                return updatedSteps;
              });
              
              if (stepsWithContent === steps.length) {
                setGeneratingContent(false);
              }
            }
          }
        } catch (error) {
          console.error("Error checking content generation status:", error);
        }
      }
    }, 5000);
    
    return () => {
      clearInterval(checkContentGenerationProgress);
    };
  }, [pathId, topic, steps.length, generatingContent, generatedSteps]);

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
