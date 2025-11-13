import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

interface SessionOptions {
  pathId?: string;
  stepId?: string;
  contentMode?: string;
  referrerSource?: string;
}

export const useLearningSession = (options: SessionOptions = {}) => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Start session
  const startSession = async () => {
    if (!user || isTracking) return;

    try {
      startTimeRef.current = new Date();

      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          path_id: options.pathId || null,
          step_id: options.stepId || null,
          content_mode: options.contentMode || null,
          referrer_source: options.referrerSource || null,
          started_at: startTimeRef.current.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      sessionIdRef.current = data.id;
      setIsTracking(true);

      console.log('[useLearningSession] Session started:', data.id);
    } catch (error) {
      console.error('[useLearningSession] Error starting session:', error);
    }
  };

  // End session
  const endSession = async () => {
    if (!sessionIdRef.current || !startTimeRef.current) return;

    try {
      const endTime = new Date();

      const { error } = await supabase
        .from('learning_sessions')
        .update({
          ended_at: endTime.toISOString(),
        })
        .eq('id', sessionIdRef.current);

      if (error) throw error;

      console.log('[useLearningSession] Session ended:', sessionIdRef.current);

      setIsTracking(false);
      sessionIdRef.current = null;
      startTimeRef.current = null;
    } catch (error) {
      console.error('[useLearningSession] Error ending session:', error);
    }
  };

  // Update session metadata
  const updateSession = async (updates: {
    audio_played?: boolean;
    audio_completed?: boolean;
    interactions_count?: number;
    content_scrolled_percent?: number;
  }) => {
    if (!sessionIdRef.current) return;

    try {
      const { error } = await supabase
        .from('learning_sessions')
        .update(updates)
        .eq('id', sessionIdRef.current);

      if (error) throw error;
    } catch (error) {
      console.error('[useLearningSession] Error updating session:', error);
    }
  };

  // Auto-start session on mount
  useEffect(() => {
    startSession();

    // Auto-end session on unmount
    return () => {
      if (sessionIdRef.current) {
        endSession();
      }
    };
  }, [user?.id, options.pathId, options.stepId]);

  // Auto-end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        // Use sendBeacon for reliable tracking on page unload
        const endTime = new Date();
        navigator.sendBeacon(
          `/api/analytics/end-session`,
          JSON.stringify({
            sessionId: sessionIdRef.current,
            endedAt: endTime.toISOString(),
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    isTracking,
    sessionId: sessionIdRef.current,
    updateSession,
    endSession,
  };
};
