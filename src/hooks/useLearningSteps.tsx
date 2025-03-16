
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
          const stepsWithDetailedContent = processedData.filter(step => !!step.detailed_content).length;
          setGeneratedSteps(stepsWithDetailedContent);
          setGeneratingContent(stepsWithDetailedContent < processedData.length);
          
          console.log(`Content generation status: ${stepsWithDetailedContent}/${processedData.length} steps generated`);
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
    
    // Set up subscription to track generation progress - IMPROVED FOR RELIABILITY
    const channel = supabase.channel(`steps-${pathId}`);
    
    const subscription = channel
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'learning_steps',
          filter: `path_id=eq.${pathId}`
        }, 
        (payload) => {
          console.log('Step updated:', payload);
          
          // Only count as generated if detailed_content is present
          if (payload.new && payload.new.detailed_content) {
            console.log('Received update with detailed content:', payload.new.id);
            
            // Refresh all steps to ensure we have the latest data
            // This ensures we don't miss any updates
            fetchLearningSteps();
            
            // Also update the individual step in state for immediate feedback
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
              // Count how many steps actually have detailed content now
              const newCount = steps.filter(s => 
                s.id === payload.new.id ? true : !!s.detailed_content
              ).length;
              
              console.log(`Generation progress updated: ${newCount}/${steps.length} steps`);
              
              if (newCount >= steps.length) {
                setGeneratingContent(false);
                console.log("All content generation complete");
              }
              
              return newCount;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status: ${status}`);
      });
      
    console.log("Subscription to learning steps updates established");
      
    return () => {
      channel.unsubscribe();
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
