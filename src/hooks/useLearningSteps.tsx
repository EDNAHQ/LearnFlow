
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";

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
  
  // Use a ref to track last update time to prevent too frequent updates
  const lastUpdateTime = useRef<number>(0);
  const updateBufferTime = 1000; // 1 second buffer between updates
  
  // Function to count how many steps have detailed content
  const countGeneratedSteps = (stepsArray: LearningStepData[]) => {
    return stepsArray.filter(step => !!step.detailed_content).length;
  };
  
  // Fetch learning steps with debouncing to prevent too many rerenders
  const fetchLearningSteps = useRef(async () => {
    // Check if enough time has passed since last update
    const now = Date.now();
    if (now - lastUpdateTime.current < updateBufferTime) {
      return; // Skip this update if too recent
    }
    
    if (!pathId) return;
    
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
        
        // Count steps with detailed content
        const stepsWithDetailedContent = countGeneratedSteps(processedData);
        setGeneratedSteps(stepsWithDetailedContent);
        setGeneratingContent(stepsWithDetailedContent < processedData.length);
        
        console.log(`Content generation status: ${stepsWithDetailedContent}/${processedData.length} steps generated`);
      } else {
        console.log("No learning steps found for path:", pathId);
      }
    } catch (error) {
      console.error("Error fetching learning steps:", error);
    } finally {
      setIsLoading(false);
      lastUpdateTime.current = Date.now(); // Update last fetch time
    }
  });

  useEffect(() => {
    if (!pathId) return;
    
    // Initial fetch
    fetchLearningSteps.current();
    
    // Set up subscription to track generation progress
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
          const now = Date.now();
          if (now - lastUpdateTime.current < updateBufferTime) {
            return; // Skip this update if too recent
          }
          
          console.log('Step updated:', payload.new.id);
          
          // Only process updates with detailed content
          if (payload.new && payload.new.detailed_content) {
            console.log('Received update with detailed content');
            
            // Update the steps state with the new data
            setSteps(prevSteps => {
              // Create updated steps array with the new data
              const updatedSteps = prevSteps.map(step => 
                step.id === payload.new.id 
                  ? {
                      ...step,
                      detailed_content: payload.new.detailed_content
                    }
                  : step
              );
              
              // Calculate new counts based on the updated steps
              const newGeneratedCount = countGeneratedSteps(updatedSteps);
              
              // Update generated steps count
              setGeneratedSteps(newGeneratedCount);
              
              // Update generation status
              setGeneratingContent(newGeneratedCount < updatedSteps.length);
              
              console.log(`Generation progress updated: ${newGeneratedCount}/${updatedSteps.length} steps`);
              
              return updatedSteps;
            });
            
            lastUpdateTime.current = Date.now(); // Update last update time
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status: ${status}`);
        
        // If subscription failed, fall back to polling
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('Subscription failed, falling back to polling');
          // Set up polling as fallback - with reduced frequency
          const pollInterval = setInterval(() => {
            fetchLearningSteps.current();
          }, 10000); // Poll every 10 seconds instead of 5
          
          return () => clearInterval(pollInterval);
        }
      });
      
    console.log("Subscription to learning steps updates established");
      
    return () => {
      channel.unsubscribe();
    };
  }, [pathId]);

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

        setSteps(prevSteps =>
          prevSteps.map(step =>
            step.id === stepId ? { ...step, completed: false } : step
          )
        );
        return false;
      }
      
      lastUpdateTime.current = Date.now(); // Update last update time
      return true;
    } catch (error) {
      console.error("Error marking step as complete:", error);
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
