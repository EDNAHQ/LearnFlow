import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/profile/useUserProfile';

export const LearningStreak: React.FC = () => {
  const { profile, loading } = useUserProfile();

  if (loading || !profile) {
    return null;
  }

  const streak = profile.learning_streak_days || 0;
  const longestStreak = profile.longest_streak_days || 0;

  // Don't show if no streak
  if (streak === 0 && longestStreak === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-none text-white">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-90">Learning Streak</p>
              <p className="text-3xl font-bold">{streak} {streak === 1 ? 'day' : 'days'}</p>
            </div>
          </div>

          {longestStreak > streak && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <TrendingUp className="h-4 w-4" />
              <div className="text-right">
                <p className="text-xs opacity-75">Best</p>
                <p className="text-sm font-semibold">{longestStreak}</p>
              </div>
            </div>
          )}
        </div>

        {streak > 0 && (
          <p className="mt-4 text-sm opacity-90">
            {streak === 1
              ? "Great start! Come back tomorrow to build your streak."
              : streak < 7
              ? `${streak} days strong! Keep the momentum going.`
              : streak < 30
              ? `${streak} days! You're building a solid learning habit.`
              : `${streak} days! Incredible dedication!`}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningStreak;
