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
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generationCompleteRef = useRef<boolean>(false);

  // Store the fetch function in a ref to avoid dependency issues
  const fetchRef = useRef(fetchLearningSteps);
  fetchRef.current = fetchLearningSteps;

  // Check if generation is complete and stop polling if needed
  useEffect(() => {
    if (!pathId || !totalSteps) return;

    if (generatedSteps >= totalSteps) {
      generationCompleteRef.current = true;

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    } else {
      generationCompleteRef.current = false;
    }
  }, [generatedSteps, pathId, totalSteps]);

  // Reset tracking whenever the path changes
  useEffect(() => {
    generationCompleteRef.current = false;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
  }, [pathId]);

  useEffect(() => {
    if (!pathId) return;

    // Set up subscription to track generation progress
    try {
      const channel = supabase.channel(`steps-${pathId}`);
      let subscriptionEstablished = false;

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
              return;
            }
            lastUpdateRef.current = now;

            fetchRef.current();
          }
        )
        .subscribe((status) => {
          subscriptionActive.current = status === 'SUBSCRIBED';
          subscriptionEstablished = status === 'SUBSCRIBED';
        });

      // Only use polling as a fallback if realtime subscription is not available
      // Delay polling start to give realtime subscription time to establish
      const pollStartTimeoutRef = setTimeout(() => {
        if (!subscriptionEstablished && !generationCompleteRef.current) {
          pollIntervalRef.current = setInterval(() => {
            if (!generationCompleteRef.current) {
              fetchRef.current();
            } else {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            }
          }, 3000);
        }
      }, 1000);

      return () => {
        clearTimeout(pollStartTimeoutRef);
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
        }, 3000); // Fallback polling every 3 seconds
      }

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [pathId]);

  // Health-check polling to guarantee progress sync even if realtime misses updates
  useEffect(() => {
    if (!pathId || !totalSteps || totalSteps === 0) return;

    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }

    healthCheckIntervalRef.current = setInterval(() => {
      if (!generationCompleteRef.current) {
        fetchRef.current();
      }
    }, 6000);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [pathId, totalSteps]);
};
