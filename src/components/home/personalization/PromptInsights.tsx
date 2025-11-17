import React from 'react';
import { usePromptInsights } from '@/hooks/personalization/usePromptInsights';
import { Loader2, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const PromptInsights = () => {
  const { insights, isLoading } = usePromptInsights();
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

  if (!insights || insights.unansweredQuestions.length === 0) {
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
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ca5a8b] rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6">
            <MessageSquare className="w-4 h-4 text-[#6654f5]" />
            <span className="text-sm font-medium text-[#6654f5]">Based on Your Questions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#0b0c18]">You Asked About</span>{' '}
            <span className="text-gradient">This</span>
          </h2>
          <p className="text-lg text-[#0b0c18]/70 max-w-2xl mx-auto font-light">
            We noticed you've been curious about these topics. Ready to dive deeper?
          </p>
        </div>

        {/* Unanswered Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.unansweredQuestions.slice(0, 6).map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#6654f5]/30 transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => handleStartLearning(question.topic)}
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 brand-gradient rounded-t-2xl" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#f2b347]" />
                    <span className="text-xs font-medium text-[#6654f5]">
                      Asked {question.frequency} {question.frequency === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0b0c18] mb-2 group-hover:text-[#6654f5] transition-colors">
                    {question.topic}
                  </h3>
                  {question.samplePrompts.length > 0 && (
                    <p className="text-sm text-[#0b0c18]/60 font-light line-clamp-2">
                      "{question.samplePrompts[0]}..."
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#6654f5] font-medium text-sm group-hover:gap-3 transition-all">
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Suggested Topics */}
        {insights.suggestedTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-lg text-[#0b0c18]/70 mb-6 font-light">
              Based on your questions, you might also want to explore:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {insights.suggestedTopics.map((topic, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => handleStartLearning(topic)}
                  className="rounded-full border-2 border-[#6654f5]/20 hover:border-[#6654f5] hover:bg-[#6654f5]/5 text-[#6654f5] font-medium"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

