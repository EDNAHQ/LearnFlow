
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LearningStepData } from "./types";

export const useRealtimeUpdates = (
  pathId: string | null,
  countGeneratedSteps: (stepsArray: LearningStepData[]) => number,
  setSteps: React.Dispatch<React.SetStateAction<LearningStepData[]>>,
  setGeneratedSteps: React.Dispatch<React.SetStateAction<number>>,
  setGeneratingContent: React.Dispatch<React.SetStateAction<boolean>>,
  generatedSteps: number,
  fetchLearningSteps: Function
) => {
  // Track last update time to throttle updates
  const lastUpdateRef = useRef<number>(Date.now());
  const updateThrottleMs = 2000; // Only update every 2 seconds
  
  // Track subscription status
  const subscriptionActive = useRef<boolean>(false);

  useEffect(() => {
    if (!pathId) return;
    
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
  }, [pathId, countGeneratedSteps, generatedSteps, updateThrottleMs, setSteps, setGeneratedSteps, setGeneratingContent, fetchLearningSteps]);
};
