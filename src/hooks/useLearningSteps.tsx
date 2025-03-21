import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Track last update time to throttle updates
  const lastUpdateRef = useRef<number>(Date.now());
  const updateThrottleMs = 2000; // Only update every 2 seconds
  
  // Track subscription status
  const subscriptionActive = useRef<boolean>(false);
  
  // Track if we've already fetched steps
  const initialFetchComplete = useRef<boolean>(false);

  // Function to count how many steps have detailed content - memoize as it's called frequently
  const countGeneratedSteps = useCallback((stepsArray: LearningStepData[]) => {
    return stepsArray.filter(step => !!step.detailed_content).length;
  }, []);

  // Fetch learning steps - extract to a reusable function
  const fetchLearningSteps = useCallback(async () => {
    if (!pathId) return;
    
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
        
        // Only update state if there are actual changes to avoid re-renders
        setSteps(prevSteps => {
          // Only update if different
          if (JSON.stringify(prevSteps) !== JSON.stringify(processedData)) {
            return processedData;
          }
          return prevSteps;
        });
        
        // Count steps with detailed content
        const stepsWithDetailedContent = countGeneratedSteps(processedData);
        
        // Only update state if count has changed
        if (stepsWithDetailedContent !== generatedSteps) {
          setGeneratedSteps(stepsWithDetailedContent);
          setGeneratingContent(stepsWithDetailedContent < processedData.length);
          console.log(`Content generation status: ${stepsWithDetailedContent}/${processedData.length} steps generated`);
        }
      } else {
        console.log("No learning steps found for path:", pathId);
      }
    } catch (error) {
      console.error("Error fetching learning steps:", error);
    } finally {
      if (!initialFetchComplete.current) {
        setIsLoading(false);
        initialFetchComplete.current = true;
      }
    }
  }, [pathId, countGeneratedSteps, generatedSteps]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!pathId) return;
    
    // Fetch data immediately
    fetchLearningSteps();
    
    // Only set up subscription if not already active
    if (!subscriptionActive.current) {
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
            // Throttle updates to prevent excessive re-renders
            const now = Date.now();
            if (now - lastUpdateRef.current < updateThrottleMs) {
              return; // Skip this update if too soon after the last one
            }
            lastUpdateRef.current = now;
            
            console.log('Step updated:', payload.new.id);
            
            // Only process updates with detailed content
            if (payload.new && payload.new.detailed_content) {
              // Update the steps state with the new data, minimizing re-renders
              setSteps(prevSteps => {
                // Check if we need to update
                const stepIndex = prevSteps.findIndex(step => step.id === payload.new.id);
                if (stepIndex === -1 || prevSteps[stepIndex].detailed_content === payload.new.detailed_content) {
                  return prevSteps; // No changes needed
                }
                
                // Create updated steps array with the new data
                const updatedSteps = [...prevSteps];
                updatedSteps[stepIndex] = {
                  ...updatedSteps[stepIndex],
                  detailed_content: payload.new.detailed_content
                };
                
                // Calculate new counts based on the updated steps
                const newGeneratedCount = countGeneratedSteps(updatedSteps);
                
                // Update generated steps count if changed
                if (newGeneratedCount !== generatedSteps) {
                  setGeneratedSteps(newGeneratedCount);
                  setGeneratingContent(newGeneratedCount < updatedSteps.length);
                  console.log(`Generation progress updated: ${newGeneratedCount}/${updatedSteps.length} steps`);
                }
                
                return updatedSteps;
              });
            }
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status: ${status}`);
          subscriptionActive.current = true;
          
          // If subscription failed, fall back to polling
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log('Subscription failed, falling back to polling');
            subscriptionActive.current = false;
            
            // Set up polling as fallback - use a ref to track the interval
            const pollInterval = setInterval(() => {
              fetchLearningSteps();
            }, 5000); // Poll every 5 seconds
            
            return () => clearInterval(pollInterval);
          }
        });
        
      console.log("Subscription to learning steps updates established");
        
      return () => {
        channel.unsubscribe();
        subscriptionActive.current = false;
      };
    }
  }, [pathId, topic, fetchLearningSteps, countGeneratedSteps, generatedSteps, updateThrottleMs]);

  // Optimistically update step completion status to prevent UI lag
  const markStepAsComplete = useCallback(async (stepId: string) => {
    try {
      // Optimistically update UI first
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        )
      );

      // Then update the database
      const { error } = await supabase
        .from('learning_steps')
        .update({ completed: true })
        .eq('id', stepId);

      if (error) {
        console.error("Error marking step as complete:", error);

        // Revert optimistic update if server update fails
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
      return false;
    }
  }, []);

  return {
    steps,
    isLoading,
    generatingContent,
    generatedSteps,
    markStepAsComplete,
    setSteps
  };
};
