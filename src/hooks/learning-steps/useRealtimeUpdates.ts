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
  fetchLearningSteps: Function,
  totalSteps?: number
) => {
  // Track last update time to throttle updates
  const lastUpdateRef = useRef<number>(Date.now());
  const updateThrottleMs = 500; // Faster updates to show progress

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

    // Only mark as complete when ALL steps have content
    if (totalSteps && totalSteps > 0 && generatedSteps >= totalSteps) {
      generationCompleteRef.current = true;

      // Clear any existing poll interval
      if (pollIntervalRef.current) {
        console.log("All content generation complete, stopping polling");
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [generatedSteps, pathId, totalSteps]);

  useEffect(() => {
    if (!pathId || generationCompleteRef.current) return;

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

            // Throttle updates to prevent excessive re-renders
            const now = Date.now();
            if (now - lastUpdateRef.current < updateThrottleMs) {
              return;
            }
            lastUpdateRef.current = now;

            fetchRef.current();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          subscriptionActive.current = status === 'SUBSCRIBED';
        });

      console.log("Subscription to learning steps updates established");

      // Aggressive polling while content is generating
      pollIntervalRef.current = setInterval(() => {
        if (!generationCompleteRef.current) {
          fetchRef.current();
        } else {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }, 2000); // Poll every 2 seconds for fast updates

      return () => {
        channel.unsubscribe();
        subscriptionActive.current = false;
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);

      if (!generationCompleteRef.current) {
        pollIntervalRef.current = setInterval(() => {
          if (!generationCompleteRef.current) {
            fetchRef.current();
          } else {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }, 2000);
      }

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [pathId]);
};
