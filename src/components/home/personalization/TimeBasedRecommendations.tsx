import React, { useMemo } from 'react';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const TimeBasedRecommendations = () => {
  const { profile } = useUserLearningProfile();

  const timeRecommendation = useMemo(() => {
    if (!profile) return null;

    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if current time matches preferred learning times
    const preferredHours = profile.preferredLearningTimes.map(t => 
      parseInt(t.split(':')[0])
    );
    
    const isOptimalTime = preferredHours.some(h => Math.abs(currentHour - h) <= 1);
    
    // Note: lastLearningDate would come from learning_sessions table if needed

    return {
      isOptimalTime,
      currentHour,
      preferredHours,
      optimalSessionLength: profile.optimalSessionLength,
    };
  }, [profile]);

  if (!profile || !timeRecommendation) {
    return null;
  }

  return (
    <section className="py-12 px-6 bg-gradient-to-br from-[#6654f5]/5 to-[#ca5a8b]/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-6 ${
            timeRecommendation.isOptimalTime
              ? 'bg-gradient-to-r from-[#f2b347]/20 to-[#ca5a8b]/20 border-2 border-[#f2b347]/30'
              : 'bg-white border-2 border-[#6654f5]/20'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              timeRecommendation.isOptimalTime
                ? 'bg-gradient-to-br from-[#f2b347] to-[#ca5a8b]'
                : 'bg-gradient-to-br from-[#6654f5] to-[#ca5a8b]'
            }`}>
              {timeRecommendation.isOptimalTime ? (
                <Zap className="w-6 h-6 text-white" />
              ) : (
                <Clock className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              {timeRecommendation.isOptimalTime ? (
                <>
                  <h3 className="text-xl font-bold text-[#0b0c18] mb-1">
                    It's Your Optimal Learning Time!
                  </h3>
                  <p className="text-[#0b0c18]/70 font-light">
                    You learn best around this time. Start a {profile.optimalSessionLength}-minute session.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-[#0b0c18] mb-1">
                    Your Best Learning Times
                  </h3>
                  <p className="text-sm text-[#0b0c18]/60 font-light">
                    {profile.preferredLearningTimes.length > 0
                      ? `You're most active at ${profile.preferredLearningTimes.join(', ')}`
                      : 'Track your learning to discover optimal times'}
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

