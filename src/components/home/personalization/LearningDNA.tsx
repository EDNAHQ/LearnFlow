import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { useUserContentPreferences } from '@/hooks/personalization/useUserContentPreferences';
import { Loader2, Zap, Clock, TrendingUp, Headphones, Eye, BookOpen, FileText, Layers, Sparkles, Target, UserCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const formatPreferenceLabel = (value: string): string => {
  const labels: Record<string, string> = {
    conversational: 'Conversational',
    formal: 'Formal',
    technical: 'Technical',
    storytelling: 'Storytelling',
    practical: 'Practical',
    brief: 'Brief',
    standard: 'Standard',
    detailed: 'Detailed',
    comprehensive: 'Comprehensive',
    simplified: 'Simplified',
    balanced: 'Balanced',
    advanced: 'Advanced',
    expert: 'Expert',
    'real-world': 'Real-World',
    theoretical: 'Theoretical',
    'code-focused': 'Code-Focused',
    'business-focused': 'Business-Focused',
    mixed: 'Mixed',
    'hands-on': 'Hands-On',
    conceptual: 'Conceptual',
    visual: 'Visual',
    analytical: 'Analytical',
  };
  return labels[value] || value;
};

export const LearningDNA = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useUserLearningProfile();
  const { preferences: contentPreferences, isLoading: preferencesLoading } = useUserContentPreferences();

  const isLoading = profileLoading || preferencesLoading;

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

  if (!profile && !contentPreferences) {
    return null;
  }

  const insights = [];

  // Add content style preference if available
  if (contentPreferences?.contentStyle?.value) {
    insights.push({
      icon: FileText,
      label: 'Content Style',
      value: formatPreferenceLabel(contentPreferences.contentStyle.value),
      description: `${contentPreferences.contentStyle.percentage}% of your projects`,
      color: 'text-[#6654f5]',
      bgColor: 'bg-[#6654f5]/10',
    });
  }

  // Add content length preference if available
  if (contentPreferences?.contentLength?.value) {
    insights.push({
      icon: BookOpen,
      label: 'Content Length',
      value: formatPreferenceLabel(contentPreferences.contentLength.value),
      description: contentPreferences.contentLength.wordRange,
      color: 'text-[#ca5a8b]',
      bgColor: 'bg-[#ca5a8b]/10',
    });
  }

  // Add complexity preference if available
  if (contentPreferences?.contentComplexity?.value) {
    insights.push({
      icon: Layers,
      label: 'Complexity Level',
      value: formatPreferenceLabel(contentPreferences.contentComplexity.value),
      description: `${contentPreferences.contentComplexity.percentage}% preference`,
      color: 'text-[#f2b347]',
      bgColor: 'bg-[#f2b347]/10',
    });
  }

  // Add learning approach preference if available
  if (contentPreferences?.learningApproach?.value) {
    insights.push({
      icon: Target,
      label: 'Learning Approach',
      value: formatPreferenceLabel(contentPreferences.learningApproach.value),
      description: `${contentPreferences.learningApproach.percentage}% of projects`,
      color: 'text-[#6654f5]',
      bgColor: 'bg-[#6654f5]/10',
    });
  }

  // Fallback to behavior-based insights if no content preferences
  if (insights.length === 0 && profile) {
    insights.push(
      {
        icon: Clock,
        label: 'Optimal Session',
        value: `${profile.optimalSessionLength} min`,
        description: 'Based on your activity',
        color: 'text-[#6654f5]',
        bgColor: 'bg-[#6654f5]/10',
      },
      {
        icon: Zap,
        label: 'Learning Style',
        value: profile.learningVelocity === 'fast' ? 'Fast Learner' : 
               profile.learningVelocity === 'deliberate' ? 'Deep Thinker' : 'Steady Pace',
        description: 'From your learning patterns',
        color: 'text-[#ca5a8b]',
        bgColor: 'bg-[#ca5a8b]/10',
      },
      {
        icon: TrendingUp,
        label: 'Success Rate',
        value: `${Math.round(profile.avgSuccessRate)}%`,
        description: 'Your completion rate',
        color: 'text-[#f2b347]',
        bgColor: 'bg-[#f2b347]/10',
      },
      {
        icon: profile.prefersAudio ? Headphones : profile.prefersVisual ? Eye : BookOpen,
        label: 'Preferred Format',
        value: profile.prefersAudio ? 'Audio' : profile.prefersVisual ? 'Visual' : 'Text',
        description: 'From your usage patterns',
        color: 'text-[#6654f5]',
        bgColor: 'bg-[#6654f5]/10',
      }
    );
  }

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
            <Zap className="w-4 h-4 text-[#6654f5]" />
            <span className="text-sm font-medium text-[#6654f5]">Your Learning DNA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#0b0c18]">We Know How</span>{' '}
            <span className="text-gradient">You Learn</span>
          </h2>
          <p className="text-lg text-[#0b0c18]/70 max-w-2xl mx-auto font-light">
            {contentPreferences && contentPreferences.projectsWithPreferences > 0
              ? `We've learned your preferences from ${contentPreferences.projectsWithPreferences} of your learning projects. Here's what we know about how you like to learn.`
              : 'Insights about your learning patterns, powered by your actual behavior'}
          </p>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl ${insight.bgColor || 'bg-gradient-to-br from-[#6654f5]/10 to-[#ca5a8b]/10'} mb-4`}>
                <insight.icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <div className="text-2xl font-bold text-[#0b0c18] mb-1">
                {insight.value}
              </div>
              <div className="text-sm text-[#0b0c18]/60 font-light mb-1">
                {insight.label}
              </div>
              {insight.description && (
                <div className="text-xs text-[#0b0c18]/50 font-light">
                  {insight.description}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Insights */}
        {((profile?.preferredLearningTimes && profile.preferredLearningTimes.length > 0) || contentPreferences?.preferredExamples?.value || profile?.devicePreference || (profile?.mostEngagedTopics && profile.mostEngagedTopics.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-semibold text-[#0b0c18] mb-6">Your Learning Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.preferredLearningTimes.length > 0 && (
                <div>
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-2">Optimal Learning Times</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredLearningTimes.map((time, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-[#6654f5]/10 to-[#ca5a8b]/10 text-[#6654f5] text-sm font-medium"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {contentPreferences?.preferredExamples?.value && (
                <div>
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f2b347]" />
                    Preferred Examples
                  </div>
                  <div className="text-lg font-semibold text-[#0b0c18]">
                    {formatPreferenceLabel(contentPreferences.preferredExamples.value)}
                  </div>
                  <div className="text-xs text-[#0b0c18]/50 font-light mt-1">
                    Used in {contentPreferences.preferredExamples.percentage}% of your projects
                  </div>
                </div>
              )}
              {profile?.devicePreference && (
                <div>
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-2">Preferred Device</div>
                  <div className="text-lg font-semibold text-[#0b0c18] capitalize">
                    {profile.devicePreference}
                  </div>
                </div>
              )}
              {profile?.mostEngagedTopics.length > 0 && (
                <div>
                  <div className="text-sm text-[#0b0c18]/60 font-light mb-2">Most Engaged Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.mostEngagedTopics.slice(0, 3).map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-[#f2b347]/10 to-[#ca5a8b]/10 text-[#ca5a8b] text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {contentPreferences && contentPreferences.projectsWithPreferences > 0 && (
              <div className="mt-6 pt-6 border-t border-[#0b0c18]/10">
                <div className="text-sm text-[#0b0c18]/60 font-light">
                  Based on preferences from {contentPreferences.projectsWithPreferences} of your {contentPreferences.totalProjects} learning projects
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* View Full Profile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={() => navigate('/profile')}
            className="brand-gradient text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <UserCircle className="w-5 h-5 mr-2" />
            View Your Complete LearnFlow Profile
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="mt-4 text-sm text-[#0b0c18]/60 font-light">
            See everything we know about your learning journey in one immersive page
          </p>
        </motion.div>
      </div>
    </section>
  );
};

