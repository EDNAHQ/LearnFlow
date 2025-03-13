
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
          toast.error("Failed to load learning steps");
          return;
        }

        if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} learning steps for path:`, pathId);
          setSteps(data);
          
          const stepsWithContent = data.filter(step => step.detailed_content).length;
          setGeneratedSteps(stepsWithContent);
          
          if (stepsWithContent < data.length) {
            setGeneratingContent(true);
            
            // Manually trigger content generation for all steps without content
            data.forEach(step => {
              if (!step.detailed_content) {
                console.log(`Triggering content generation for step: ${step.title}`);
                generateStepContent(
                  { id: step.id, title: step.title, description: step.content || "" },
                  topic || "",
                  false
                ).catch(err => {
                  console.error(`Error generating content for step ${step.id}:`, err);
                });
              }
            });
            
            toast.info(`Generating detailed content for your learning path (${stepsWithContent}/${data.length} steps completed)`, {
              duration: 5000,
              id: "content-generation-toast"
            });
          }
        } else {
          console.log("No learning steps found for path:", pathId);
          toast.info("No learning steps found for this project.");
        }
      } catch (error) {
        console.error("Error fetching learning steps:", error);
        toast.error("Failed to load learning steps");
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
              
              toast.info(`Generating content (${stepsWithContent}/${steps.length} steps completed)`, {
                duration: 5000,
                id: "content-generation-toast"
              });
              
              if (stepsWithContent === steps.length) {
                setGeneratingContent(false);
                toast.success("All learning content has been generated!", {
                  id: "content-generation-complete"
                });
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
