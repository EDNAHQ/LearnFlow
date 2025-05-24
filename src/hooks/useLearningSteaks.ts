
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface StreakData {
  currentStreak: number;
  lastActivity: string | null;
  longestStreak: number;
}

export const useLearningSteaks = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastActivity: null,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStreakData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGSQL_RELATION_DOES_NOT_EXIST') {
        console.error("Error fetching streak data:", error);
        return;
      }
      
      if (data) {
        setStreakData({
          currentStreak: data.current_streak || 0,
          lastActivity: data.last_activity,
          longestStreak: data.longest_streak || 0
        });
      }
    } catch (error) {
      console.error("Error in fetchStreakData:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // If this is the first activity or the user hasn't been active today
      if (!streakData.lastActivity || streakData.lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check if we need to continue or reset the streak
        let newStreak = 1; // Default to 1 if we're resetting
        
        if (streakData.lastActivity === yesterdayStr) {
          // Last activity was yesterday, continue streak
          newStreak = streakData.currentStreak + 1;
        }
        
        const newLongestStreak = Math.max(newStreak, streakData.longestStreak);
        
        // Update in database
        const { error } = await supabase
          .from('user_streaks')
          .upsert({
            user_id: user.id,
            current_streak: newStreak,
            last_activity: today,
            longest_streak: newLongestStreak
          });
          
        if (error) {
          console.error("Error updating streak:", error);
          return;
        }
        
        // Update local state
        setStreakData({
          currentStreak: newStreak,
          lastActivity: today,
          longestStreak: newLongestStreak
        });
      }
    } catch (error) {
      console.error("Error in updateStreak:", error);
    }
  };

  // Initialize streak data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchStreakData();
    }
  }, [user?.id]);

  return {
    streakData,
    updateStreak,
    loading
  };
};
