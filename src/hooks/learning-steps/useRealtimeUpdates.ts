import { useEffect, useRef } from "react";
import { subscribeToStepUpdates } from "@/services/learningStepsService";

export const useRealtimeUpdates = (
  pathId: string | null,
  fetchLearningSteps: Function
) => {
  // Track last update time to throttle updates
  const lastUpdateRef = useRef<number>(Date.now());
  const updateThrottleMs = 500; // Further reduced throttle time for more frequent updates
  

  useEffect(() => {
    if (!pathId) return;
    
    // Always fetch steps immediately when hook mounts or pathId changes
    fetchLearningSteps();
    
    // Set up subscription to track generation progress
    try {
      const unsubscribe = subscribeToStepUpdates(pathId, (payload) => {
        console.log('Step updated (realtime):', payload.new.id);

        // Throttle updates to prevent excessive re-renders but keep it fast enough to show progress
        const now = Date.now();
        if (now - lastUpdateRef.current < updateThrottleMs) {
          return; // Skip this update if too soon after the last one
        }
        lastUpdateRef.current = now;

        // Force a refresh of all steps to ensure we have the latest data
        fetchLearningSteps();
      });

      console.log("Subscription to learning steps updates established");

      // Set up polling even with active subscription as a backup
      const backupPollInterval = setInterval(() => {
        fetchLearningSteps();
      }, 5000); // Backup poll every 5 seconds

      return () => {
        unsubscribe();
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
