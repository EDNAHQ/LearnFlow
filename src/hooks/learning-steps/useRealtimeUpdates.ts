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
  const updateThrottleMs = 500; // Further reduced throttle time for more frequent updates
  
  // Track subscription status
  const subscriptionActive = useRef<boolean>(false);

  useEffect(() => {
    if (!pathId) return;
    
    // Always fetch steps immediately when hook mounts or pathId changes
    fetchLearningSteps();
    
    // Set up subscription to track generation progress
    try {
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
            console.log('Step updated (realtime):', payload.new.id);
            
            // Throttle updates to prevent excessive re-renders but keep it fast enough to show progress
            const now = Date.now();
            if (now - lastUpdateRef.current < updateThrottleMs) {
              return; // Skip this update if too soon after the last one
            }
            lastUpdateRef.current = now;
            
            // Force a refresh of all steps to ensure we have the latest data
            fetchLearningSteps();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          subscriptionActive.current = status === 'SUBSCRIBED';
          
          // If subscription failed, fall back to polling
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log('Subscription failed, falling back to polling');
            subscriptionActive.current = false;
            
            // Set up polling as fallback - use a ref to track the interval
            const pollInterval = setInterval(() => {
              fetchLearningSteps();
            }, 2000); // Poll every 2 seconds
            
            return () => clearInterval(pollInterval);
          }
        });
        
      console.log("Subscription to learning steps updates established");
        
      // Set up polling even with active subscription as a backup
      const backupPollInterval = setInterval(() => {
        fetchLearningSteps();
      }, 5000); // Backup poll every 5 seconds
        
      return () => {
        channel.unsubscribe();
        subscriptionActive.current = false;
        clearInterval(backupPollInterval);
      };
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
      
      // If subscription setup fails, fall back to aggressive polling
      const pollInterval = setInterval(() => {
        fetchLearningSteps();
      }, 2000);
      
      return () => clearInterval(pollInterval);
    }
  }, [pathId, fetchLearningSteps, updateThrottleMs]);
};
