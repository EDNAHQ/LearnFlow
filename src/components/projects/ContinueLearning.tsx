import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/projects/useProjects';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/auth';

interface ProjectWithInsights {
  id: string;
  topic: string;
  progress: number;
  lastAccessed?: string;
  daysSinceLastAccess?: number;
  strugglingStep?: number;
  needsRemediation?: boolean;
  estimatedTimeRemaining?: number;
}

export const ContinueLearning = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { profile } = useUserLearningProfile();
  const navigate = useNavigate();
  const [projectsWithInsights, setProjectsWithInsights] = React.useState<ProjectWithInsights[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user || !projects.length) {
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      try {
        const inProgressProjects = projects.filter(p => !p.is_completed && (p.progress || 0) > 0);
        
        const insights = await Promise.all(
          inProgressProjects.slice(0, 3).map(async (project) => {
            // Get last learning session
            const { data: lastSessionData } = await supabase
              .from('learning_sessions')
              .select('started_at, step_id, path_id')
              .eq('user_id', user.id)
              .eq('path_id', project.id)
              .order('started_at', { ascending: false })
              .limit(1);
            
            const lastSession = lastSessionData && lastSessionData.length > 0 ? lastSessionData[0] : null;

            // Get progress tracking for remediation
            const { data: progressData } = await supabase
              .from('progress_tracking')
              .select('step_id, remediation_needed, difficulty_rating')
              .eq('user_id', user.id)
              .eq('module_id', project.id)
              .eq('remediation_needed', true)
              .limit(1);

            // Get steps to find struggling step
            const { data: steps } = await supabase
              .from('learning_steps')
              .select('id, order_index, completed')
              .eq('path_id', project.id)
              .order('order_index', { ascending: true });

            const completedSteps = steps?.filter(s => s.completed).length || 0;
            const totalSteps = steps?.length || 0;
            const strugglingStep = progressData && progressData.length > 0 && steps
              ? steps.findIndex(s => s.id === progressData[0].step_id) + 1
              : undefined;

            const lastAccessed = lastSession?.started_at;
            const daysSinceLastAccess = lastAccessed
              ? Math.floor((Date.now() - new Date(lastAccessed).getTime()) / (1000 * 60 * 60 * 24))
              : undefined;

            // Estimate time remaining based on profile
            const avgCompletionTime = profile?.avgCompletionTime || 300; // seconds
            const remainingSteps = totalSteps - completedSteps;
            const estimatedTimeRemaining = Math.round((remainingSteps * avgCompletionTime) / 60); // minutes

            return {
              id: project.id,
              topic: project.topic,
              progress: project.progress || 0,
              lastAccessed,
              daysSinceLastAccess,
              strugglingStep: strugglingStep !== undefined ? strugglingStep + 1 : undefined,
              needsRemediation: progressData && progressData.length > 0,
              estimatedTimeRemaining,
            };
          })
        );

        // Sort by: needs remediation > days since access > progress
        insights.sort((a, b) => {
          if (a.needsRemediation && !b.needsRemediation) return -1;
          if (!a.needsRemediation && b.needsRemediation) return 1;
          if (a.daysSinceLastAccess && b.daysSinceLastAccess) {
            return b.daysSinceLastAccess - a.daysSinceLastAccess;
          }
          return b.progress - a.progress;
        });

        setProjectsWithInsights(insights);
      } catch (error) {
        console.error('Error fetching continue learning insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user, projects, profile]);

  if (loading || projectsWithInsights.length === 0) {
    return null;
  }

  const handleContinue = (projectId: string, strugglingStep?: number) => {
    const stepIndex = strugglingStep !== undefined ? strugglingStep - 1 : 0;
    navigate(`/content/${projectId}/step/${stepIndex}`);
  };

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0b0c18]">Continue Where You Left Off</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsWithInsights.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#6654f5]/30 transition-all duration-300 hover:shadow-xl"
          >
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0b0c18]">{project.topic}</span>
                <span className="text-sm text-[#0b0c18]/60">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="brand-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-2 mb-4">
              {project.needsRemediation && (
                <div className="flex items-center gap-2 text-sm text-[#ca5a8b]">
                  <AlertCircle className="w-4 h-4" />
                  <span>Needs review - step {project.strugglingStep}</span>
                </div>
              )}
              {project.daysSinceLastAccess !== undefined && project.daysSinceLastAccess > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#0b0c18]/60">
                  <Clock className="w-4 h-4" />
                  <span>
                    {project.daysSinceLastAccess === 1
                      ? 'Paused yesterday'
                      : `Paused ${project.daysSinceLastAccess} days ago`}
                  </span>
                </div>
              )}
              {project.estimatedTimeRemaining && (
                <div className="flex items-center gap-2 text-sm text-[#0b0c18]/60">
                  <TrendingUp className="w-4 h-4" />
                  <span>~{project.estimatedTimeRemaining} min remaining</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <Button
              onClick={() => handleContinue(project.id, project.strugglingStep)}
              className="w-full brand-gradient text-white hover:opacity-90"
            >
              {project.needsRemediation ? 'Review Step' : 'Continue Learning'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

