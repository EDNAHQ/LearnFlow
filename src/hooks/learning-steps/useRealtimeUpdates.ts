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
  const updateThrottleMs = 3000; // Further increased throttle time

  // Track subscription status and intervals
  const subscriptionActive = useRef<boolean>(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generationCompleteRef = useRef<boolean>(false);

  // Store the fetch function in a ref to avoid dependency issues
  const fetchRef = useRef(fetchLearningSteps);
  fetchRef.current = fetchLearningSteps;

  // Check if generation is complete and stop polling if needed
  useEffect(() => {
    if (!pathId) return;

    // Check if this looks like generation is complete
    if (generatedSteps > 0) {
      // Assume generation is complete if we have generated steps
      // This heuristic stops polling once we have content
      generationCompleteRef.current = true;

      // Clear any existing poll interval
      if (pollIntervalRef.current) {
        console.log("Generation appears complete, stopping polling");
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [generatedSteps, pathId]);

  useEffect(() => {
    if (!pathId || generationCompleteRef.current) return;

    // Don't fetch immediately here - let parent handle initial fetch
    
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
            fetchRef.current();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          subscriptionActive.current = status === 'SUBSCRIBED';
          
          // If subscription failed, fall back to polling
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log('Subscription failed, falling back to polling');
            subscriptionActive.current = false;

            // Only set up polling if generation is not complete
            if (!generationCompleteRef.current) {
              // Set up polling as fallback
              pollIntervalRef.current = setInterval(() => {
                if (!generationCompleteRef.current) {
                  fetchRef.current();
                } else {
                  // Clear interval if generation completed
                  if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                  }
                }
              }, 8000); // Poll every 8 seconds (much less frequent)
            }

            return () => {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            };
          }
        });
        
      console.log("Subscription to learning steps updates established");

      // Only start backup polling if the subscription later closes or errors
      let backupPollInterval: number | undefined = undefined as any;

      return () => {
        channel.unsubscribe();
        subscriptionActive.current = false;
        if (backupPollInterval) clearInterval(backupPollInterval);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
      
      // If subscription setup fails, fall back to less aggressive polling
      if (!generationCompleteRef.current) {
        pollIntervalRef.current = setInterval(() => {
          if (!generationCompleteRef.current) {
            fetchRef.current();
          } else {
            // Clear interval if generation completed
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }, 10000); // Poll every 10 seconds (very infrequent)
      }

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [pathId]); // Only depend on pathId to prevent subscription recreation
};
