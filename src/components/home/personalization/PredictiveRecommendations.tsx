import React from 'react';
import { usePredictiveRecommendations } from '@/hooks/personalization/usePredictiveRecommendations';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AILoadingState from '@/components/ai/AILoadingState';

export const PredictiveRecommendations = () => {
  const { recommendations, isLoading } = usePredictiveRecommendations();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <AILoadingState 
            variant="animated" 
            message="Discovering personalized recommendations for you..."
            className="py-16"
          />
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleStartLearning = (topic: string) => {
    // Trigger custom event to open wizard with topic pre-filled
    window.dispatchEvent(new CustomEvent('openLearningWizard', { detail: { topic } }));
  };

  // Clean topic name (remove prefixes like "Deep dive:", "Reinforce", etc.)
  const cleanTopicName = (topic: string): string => {
    return topic
      .replace(/^(Deep dive|Reinforce|Build a|Goal):\s*/i, '')
      .trim();
  };

  // Sort recommendations by priority and confidence
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.confidence - a.confidence;
  });

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6654f5] rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ca5a8b] rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#f2b347] rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#6654f5]" />
            <span className="text-sm font-medium text-[#6654f5]">Personalized for You</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#0b0c18]">Recommended Learning</span>{' '}
            <span className="text-gradient">Paths</span>
          </h2>
          <p className="text-lg text-[#0b0c18]/70 max-w-2xl mx-auto font-light">
            Based on your learning history, questions, and goals. Click any card to start learning instantly.
          </p>
        </div>

        {/* All Recommendations Grid - Always 8 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedRecommendations.map((rec, index) => {
            const isHighPriority = rec.priority === 'high';
            const cleanTopic = cleanTopicName(rec.topic);
            
            return (
              <motion.div
                key={`${rec.topic}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  bg-white rounded-xl p-6 border-2 transition-all cursor-pointer group
                  ${isHighPriority 
                    ? 'border-[#ca5a8b]/30 hover:border-[#ca5a8b] shadow-md hover:shadow-lg' 
                    : 'border-gray-200 hover:border-[#6654f5]/40 shadow-sm hover:shadow-md'
                  }
                  hover:-translate-y-1
                `}
                onClick={() => handleStartLearning(cleanTopic)}
              >
                <div className="flex flex-col h-full">
                  {/* Priority badge */}
                  {isHighPriority && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#ca5a8b]/20 text-[#ca5a8b]">
                        High Priority
                      </span>
                      <span className="text-xs text-[#0b0c18]/50">
                        {rec.confidence}% match
                      </span>
                    </div>
                  )}
                  
                  {!isHighPriority && (
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-[#f2b347]" />
                      <span className="text-xs text-[#0b0c18]/50">
                        {rec.confidence}% match
                      </span>
                    </div>
                  )}

                  {/* Topic title */}
                  <h4 className={`
                    font-semibold text-[#0b0c18] mb-2 group-hover:text-[#6654f5] transition-colors
                    ${isHighPriority ? 'text-lg' : 'text-base'}
                  `}>
                    {cleanTopic}
                  </h4>

                  {/* Reason */}
                  <p className="text-sm text-[#0b0c18]/60 font-light mb-4 flex-1">
                    {rec.reason}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-[#6654f5] group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">Start Learning</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

