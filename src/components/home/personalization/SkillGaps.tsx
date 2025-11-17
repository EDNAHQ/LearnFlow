import React, { useState, useEffect } from 'react';
import { useSkillGaps } from '@/hooks/personalization/useSkillGaps';
import { Loader2, Target, TrendingUp, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { generateLearningPlan } from '@/utils/learning';
import { startBackgroundContentGeneration } from '@/utils/learning/backgroundContentGeneration';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const SkillGaps = () => {
  const { skillGaps, isLoading } = useSkillGaps();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [creatingTopic, setCreatingTopic] = useState<string | null>(null);
  const [preCreatingTopic, setPreCreatingTopic] = useState<string | null>(null);

  // Pre-create the top recommendation in the background
  useEffect(() => {
    if (!user || !skillGaps || !skillGaps.recommendations || skillGaps.recommendations.length === 0) return;
    
    const topRecommendation = skillGaps.recommendations[0];
    if (topRecommendation && topRecommendation.priority === 'high') {
      console.log('Pre-creating top recommendation:', topRecommendation.topic);
      setPreCreatingTopic(topRecommendation.topic);
      // Pre-create in background without blocking UI
      createProjectInBackground(topRecommendation.topic, user.id).catch(err => {
        console.error('Background pre-creation failed:', err);
        setPreCreatingTopic(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillGaps, user]);

  const createProjectInBackground = async (topic: string, userId: string) => {
    try {
      // Check if project already exists
      const { data: existing } = await supabase
        .from('learning_paths')
        .select('id')
        .eq('topic', topic)
        .eq('user_id', userId)
        .limit(1);

      if (existing && existing.length > 0) {
        setPreCreatingTopic(null);
        return existing[0].id;
      }

      // Create project and steps
      const steps = await generateLearningPlan(topic);
      
      // Get the path ID
      const { data: paths } = await supabase
        .from('learning_paths')
        .select('id')
        .eq('topic', topic)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (paths && paths.length > 0) {
        const pathId = paths[0].id;
        
        // Auto-approve and start content generation
        await supabase
          .from('learning_paths')
          .update({ is_approved: true })
          .eq('id', pathId);

        // Start background content generation
        startBackgroundContentGeneration(steps, topic, pathId).catch(err => {
          console.error('Background content generation failed:', err);
        });

        setPreCreatingTopic(null);
        return pathId;
      }
    } catch (error) {
      console.error('Background project creation failed:', error);
      setPreCreatingTopic(null);
      throw error;
    }
  };

  const handleStartLearning = async (topic: string) => {
    console.log('handleStartLearning called with topic:', topic);
    
    if (!user) {
      console.log('No user, navigating to sign-in');
      navigate('/sign-in');
      return;
    }

    console.log('Setting creating topic state');
    setCreatingTopic(topic);

    try {
      console.log('Checking for existing project...');
      // Check if project already exists
      const { data: existing, error: existingError } = await supabase
        .from('learning_paths')
        .select('id, is_approved')
        .eq('topic', topic)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingError) {
        console.error('Error checking existing paths:', existingError);
        throw existingError;
      }

      let pathId: string;

      if (existing && existing.length > 0) {
        console.log('Found existing project:', existing[0].id);
        pathId = existing[0].id;
        
        // If not approved, approve it
        if (!existing[0].is_approved) {
          console.log('Approving existing project...');
          const { error: approveError } = await supabase
            .from('learning_paths')
            .update({ is_approved: true })
            .eq('id', pathId);

          if (approveError) {
            console.error('Error approving project:', approveError);
            throw approveError;
          }

          // Get steps and start content generation
          const { data: steps, error: stepsError } = await supabase
            .from('learning_steps')
            .select('id, title, content')
            .eq('path_id', pathId)
            .order('order_index');

          if (stepsError) {
            console.error('Error fetching steps:', stepsError);
          } else if (steps && steps.length > 0) {
            console.log('Starting background content generation for existing project');
            startBackgroundContentGeneration(
              steps.map(s => ({ id: s.id, title: s.title, description: s.content || '' })),
              topic,
              pathId
            ).catch(err => console.error('Content generation failed:', err));
          }
        }

        // Navigate directly to content
        console.log('Navigating to existing project:', pathId);
        navigate(`/content/${pathId}/step/0`);
        setCreatingTopic(null);
        return;
      }

      // Create new project
      console.log('No existing project found, creating new one...');
      toast({
        title: "Creating your learning path...",
        description: "We're setting everything up for you right now!",
      });

      console.log('Calling generateLearningPlan...');
      const steps = await generateLearningPlan(topic);
      console.log('Generated steps:', steps.length);

      // Get the newly created path ID
      const { data: paths, error: pathsError } = await supabase
        .from('learning_paths')
        .select('id')
        .eq('topic', topic)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pathsError) {
        console.error('Error fetching created path:', pathsError);
        throw pathsError;
      }

      if (!paths || paths.length === 0) {
        console.error('No path found after creation');
        throw new Error('Failed to create learning path');
      }

      pathId = paths[0].id;
      console.log('Created path ID:', pathId);

      // Auto-approve immediately
      console.log('Auto-approving project...');
      const { error: approveError } = await supabase
        .from('learning_paths')
        .update({ is_approved: true })
        .eq('id', pathId);

      if (approveError) {
        console.error('Error approving project:', approveError);
        throw approveError;
      }

      // Start background content generation immediately
      console.log('Starting background content generation...');
      startBackgroundContentGeneration(steps, topic, pathId).catch(err => {
        console.error('Content generation failed:', err);
      });

      toast({
        title: "Learning path created!",
        description: "Content is being generated in the background.",
      });

      // Navigate directly to content page
      console.log('Navigating to content page:', pathId);
      navigate(`/content/${pathId}/step/0`);
      setCreatingTopic(null);
    } catch (error) {
      console.error('Error creating learning path:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error creating project",
        description: errorMessage || "Please try again. We'll navigate you to create it manually.",
        variant: "destructive"
      });
      // Fallback: navigate to plan page
      sessionStorage.setItem('learn-topic', topic);
      navigate(`/plan?topic=${encodeURIComponent(topic)}`);
      setCreatingTopic(null);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#6654f5] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (!skillGaps) {
    return null;
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ca5a8b] rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#f2b347] rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6">
            <Target className="w-4 h-4 text-[#ca5a8b]" />
            <span className="text-sm font-medium text-[#ca5a8b]">Skill Analysis</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#0b0c18]">Skills to</span>{' '}
            <span className="text-gradient">Master</span>
          </h2>
          <p className="text-lg text-[#0b0c18]/70 max-w-2xl mx-auto font-light">
            Bridge the gap between what you've learned and what you've built
          </p>
        </div>

        {/* Strengths */}
        {skillGaps.strengths && skillGaps.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#f2b347]" />
              <h3 className="text-xl font-semibold text-[#0b0c18]">Your Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {skillGaps.strengths.map((strength, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f2b347]/20 to-[#f2b347]/10 text-[#0b0c18] font-medium border border-[#f2b347]/30"
                >
                  {strength}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Opportunities */}
        {skillGaps.opportunities && skillGaps.opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-[#ca5a8b]" />
              <h3 className="text-xl font-semibold text-[#0b0c18]">Practice Opportunities</h3>
            </div>
            <p className="text-sm text-[#0b0c18]/60 mb-4 font-light">
              You've learned these skills but haven't built anything yet. Practice makes perfect!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillGaps.opportunities.slice(0, 6).map((opportunity, idx) => {
                const topic = `Build a ${opportunity} project`;
                const isCreating = creatingTopic === topic;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border-2 border-[#ca5a8b]/20 hover:border-[#ca5a8b] transition-all cursor-pointer group relative"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isCreating) {
                        console.log('Opportunity clicked:', topic);
                        handleStartLearning(topic);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#0b0c18] group-hover:text-[#ca5a8b] transition-colors">
                        {opportunity}
                      </span>
                      {isCreating ? (
                        <Loader2 className="w-4 h-4 text-[#ca5a8b] animate-spin" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-[#ca5a8b] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    {isCreating && (
                      <div className="absolute inset-0 bg-[#ca5a8b]/5 rounded-xl flex items-center justify-center">
                        <div className="flex items-center gap-2 text-[#ca5a8b] text-sm font-medium">
                          <Sparkles className="w-4 h-4" />
                          Creating...
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {skillGaps.recommendations && skillGaps.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-semibold text-[#0b0c18] mb-6">Recommended Next Steps</h3>
            <div className="space-y-4">
              {skillGaps.recommendations.map((rec, idx) => {
                const isCreating = creatingTopic === rec.topic;
                const isPreCreating = preCreatingTopic === rec.topic;
                return (
                  <div
                    key={idx}
                    className="relative flex items-start justify-between p-4 rounded-xl bg-gradient-to-r from-[#6654f5]/5 to-[#ca5a8b]/5 hover:from-[#6654f5]/10 hover:to-[#ca5a8b]/10 transition-all cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isCreating) {
                        console.log('Recommendation clicked:', rec.topic);
                        handleStartLearning(rec.topic);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          rec.priority === 'high' 
                            ? 'bg-[#ca5a8b]/20 text-[#ca5a8b]' 
                            : rec.priority === 'medium'
                            ? 'bg-[#f2b347]/20 text-[#f2b347]'
                            : 'bg-[#6654f5]/20 text-[#6654f5]'
                        }`}>
                          {rec.priority}
                        </span>
                        <h4 className="font-semibold text-[#0b0c18] group-hover:text-[#6654f5] transition-colors">
                          {rec.topic}
                        </h4>
                        {(isCreating || isPreCreating) && (
                          <Loader2 className="w-4 h-4 text-[#6654f5] animate-spin ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-[#0b0c18]/60 font-light">{rec.reason}</p>
                      {isPreCreating && (
                        <p className="text-xs text-[#6654f5] mt-2 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Pre-creating in background...
                        </p>
                      )}
                    </div>
                    {isCreating && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="flex items-center gap-2 text-[#6654f5] text-sm font-medium">
                          <Sparkles className="w-4 h-4" />
                          Creating your learning path...
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

