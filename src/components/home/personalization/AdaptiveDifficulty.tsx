import React from 'react';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { Loader2, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AdaptiveDifficulty = () => {
  const { profile, isLoading } = useUserLearningProfile();
  const navigate = useNavigate();

  if (isLoading || !profile) {
    return null;
  }

  // Determine difficulty recommendation
  const getDifficultyRecommendation = () => {
    if (profile.difficultyGap < -0.5) {
      return {
        type: 'too_easy',
        message: 'You found recent topics too easy',
        suggestion: 'Try something more challenging',
        topics: ['Advanced concepts', 'Complex projects', 'Expert-level content'],
      };
    } else if (profile.difficultyGap > 0.5) {
      return {
        type: 'too_hard',
        message: 'Recent topics were challenging',
        suggestion: 'Let\'s review fundamentals',
        topics: ['Foundational concepts', 'Step-by-step guides', 'Beginner-friendly content'],
      };
    } else if (profile.avgSuccessRate > 85 && profile.hintUsageRate < 0.2) {
      return {
        type: 'ready_for_more',
        message: 'You\'re mastering content quickly',
        suggestion: 'Ready for advanced topics',
        topics: ['Advanced techniques', 'Complex scenarios', 'Expert challenges'],
      };
    } else if (profile.remediationFrequency > 0.3) {
      return {
        type: 'needs_review',
        message: 'You\'re struggling with some concepts',
        suggestion: 'Let\'s strengthen your foundation',
        topics: ['Review fundamentals', 'Practice exercises', 'Step-by-step tutorials'],
      };
    }
    return null;
  };

  const recommendation = getDifficultyRecommendation();

  if (!recommendation) {
    return null;
  }

  const handleStartLearning = (topic: string) => {
    sessionStorage.setItem('learn-topic', topic);
    navigate('/projects');
  };

  return (
    <section className="py-16 px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#6654f5] rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f2b347] rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#6654f5]/10 via-[#ca5a8b]/10 to-[#f2b347]/10 rounded-2xl p-8 border-2 border-[#6654f5]/20"
        >
          <div className="flex items-start gap-4 mb-6">
            {recommendation.type === 'too_easy' || recommendation.type === 'ready_for_more' ? (
              <TrendingUp className="w-8 h-8 text-[#f2b347] flex-shrink-0" />
            ) : (
              <TrendingDown className="w-8 h-8 text-[#ca5a8b] flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#0b0c18] mb-2">
                {recommendation.message}
              </h3>
              <p className="text-lg text-[#0b0c18]/70 font-light mb-6">
                {recommendation.suggestion}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-[#0b0c18]">
                    {Math.round(profile.avgSuccessRate)}%
                  </div>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-1">Difficulty Gap</div>
                  <div className="text-2xl font-bold text-[#0b0c18]">
                    {profile.difficultyGap > 0 ? '+' : ''}{profile.difficultyGap.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-1">Hint Usage</div>
                  <div className="text-2xl font-bold text-[#0b0c18]">
                    {Math.round(profile.hintUsageRate * 100)}%
                  </div>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-1">Remediation</div>
                  <div className="text-2xl font-bold text-[#0b0c18]">
                    {Math.round(profile.remediationFrequency * 100)}%
                  </div>
                </div>
              </div>

              {/* Topic Suggestions */}
              <div className="flex flex-wrap gap-3">
                {recommendation.topics.map((topic, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleStartLearning(topic)}
                    className="brand-gradient text-white hover:opacity-90 rounded-full px-6"
                  >
                    {topic}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

