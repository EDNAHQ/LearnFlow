import React from 'react';
import { usePredictiveRecommendations } from '@/hooks/personalization/usePredictiveRecommendations';
import { Loader2, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const PredictiveRecommendations = () => {
  const { recommendations, isLoading } = usePredictiveRecommendations();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#6654f5]" />
          </div>
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleStartLearning = (topic: string) => {
    sessionStorage.setItem('learn-topic', topic);
    navigate('/projects');
  };

  const highPriority = recommendations.filter(r => r.priority === 'high');
  const mediumPriority = recommendations.filter(r => r.priority === 'medium');

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6654f5] rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ca5a8b] rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#6654f5]" />
            <span className="text-sm font-medium text-[#6654f5]">AI-Powered Predictions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#0b0c18]">What You'll Want to</span>{' '}
            <span className="text-gradient">Learn Next</span>
          </h2>
          <p className="text-lg text-[#0b0c18]/70 max-w-2xl mx-auto font-light">
            Based on your learning patterns, questions, and goals
          </p>
        </div>

        {/* High Priority Recommendations */}
        {highPriority.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#0b0c18] mb-4">High Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highPriority.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border-2 border-[#ca5a8b]/20 hover:border-[#ca5a8b] transition-all cursor-pointer group"
                  onClick={() => handleStartLearning(rec.topic)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#ca5a8b]/20 text-[#ca5a8b]">
                          {rec.confidence}% confidence
                        </span>
                        <span className="text-xs text-[#0b0c18]/60">
                          {rec.signals.join(', ')}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-[#0b0c18] mb-2 group-hover:text-[#ca5a8b] transition-colors">
                        {rec.topic}
                      </h4>
                      <p className="text-sm text-[#0b0c18]/60 font-light">{rec.reason}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#6654f5] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority Recommendations */}
        {mediumPriority.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-[#0b0c18] mb-4">Also Consider</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mediumPriority.slice(0, 6).map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (highPriority.length + index) * 0.1 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#6654f5]/30 transition-all cursor-pointer group"
                  onClick={() => handleStartLearning(rec.topic)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#f2b347]" />
                    <span className="text-xs text-[#0b0c18]/60">{rec.confidence}% match</span>
                  </div>
                  <h4 className="font-semibold text-[#0b0c18] mb-1 group-hover:text-[#6654f5] transition-colors">
                    {rec.topic}
                  </h4>
                  <p className="text-xs text-[#0b0c18]/60 font-light line-clamp-2">{rec.reason}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

