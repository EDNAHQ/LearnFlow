
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowLeft, Book, Clock, ExternalLink, Trophy, CheckCircle, Sparkles } from "lucide-react";
import { UserNav } from "@/components/UserNav";
import { toast } from "sonner";

interface LearningProject {
  id: string;
  topic: string;
  created_at: string;
  is_approved: boolean;
  is_completed: boolean;
  progress?: number;
}

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<LearningProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('learning_paths')
          .select('id, topic, created_at, is_approved, is_completed')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching learning projects:", error);
          toast.error("Failed to load your learning projects");
          return;
        }

        if (!data || !Array.isArray(data)) {
          setProjects([]);
          setLoading(false);
          return;
        }

        const projectsWithProgress = await Promise.all(
          data.map(async (project) => {
            const { data: steps, error: stepsError } = await supabase
              .from('learning_steps')
              .select('id, completed')
              .eq('path_id', project.id);

            if (stepsError) {
              console.error("Error fetching steps:", stepsError);
              return {
                ...project,
                progress: 0,
                is_completed: project.is_completed || false
              };
            }

            const completedSteps = steps ? steps.filter(step => step.completed).length : 0;
            const totalSteps = steps ? steps.length : 0;
            const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

            return {
              ...project,
              progress,
              is_completed: project.is_completed || false
            };
          })
        );

        setProjects(projectsWithProgress);
      } catch (error) {
        console.error("Error in fetchProjects:", error);
        toast.error("Something went wrong while loading your projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleProjectClick = (project: LearningProject) => {
    // Always allow clicking regardless of completion status
    sessionStorage.setItem("learn-topic", project.topic);
    sessionStorage.setItem("learning-path-id", project.id);

    if (project.is_approved) {
      navigate("/content");
    } else {
      navigate("/plan");
    }
  };

  const handleNewProject = () => {
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getProjectStatusLabel = (project: LearningProject) => {
    if (project.is_completed) return { label: 'Completed', bgColor: 'bg-green-100 text-green-800' };
    if (project.is_approved) return { label: 'In Progress', bgColor: 'bg-brand-purple/20 text-brand-purple' };
    return { label: 'Plan Created', bgColor: 'bg-brand-gold/20 text-brand-gold' };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-gray-700 hover:text-brand-purple" 
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </div>
            
            <div className="text-brand-purple font-medium text-lg">
              LearnFlow
            </div>
            
            <div>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10 text-center">
            <div className="inline-flex justify-center items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-brand-purple/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-brand-purple" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-brand-purple">Your Learning Projects</h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Review and continue your learning journey
            </p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin mb-4"></div>
              <p className="text-gray-500 animate-pulse-soft">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-xl">
              <Book className="w-12 h-12 mx-auto mb-4 text-brand-purple opacity-50" />
              <h3 className="text-xl font-medium mb-2">No learning projects yet</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by creating your first project</p>
              <Button 
                onClick={handleNewProject} 
                className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect"
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {projects.map((project) => {
                  const status = getProjectStatusLabel(project);
                  const isCompleted = Boolean(project.is_completed);
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`p-5 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                        isCompleted 
                          ? 'bg-gray-50 border-l-4 border-l-green-500' 
                          : 'bg-gray-50 hover:border-l-brand-purple hover:border-l-4'
                      }`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                          {isCompleted && (
                            <CheckCircle className="inline-block w-4 h-4 text-green-600 mr-1.5" />
                          )}
                          {project.topic}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="h-2 w-full bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-brand-purple'}`} 
                            style={{ width: `${isCompleted ? 100 : (project.progress || 0)}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {isCompleted ? '100% complete' : `${project.progress || 0}% complete`}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${status.bgColor}`}>
                            {status.label}
                          </span>
                        </div>
                        {!isCompleted && (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs text-brand-purple hover:text-brand-purple/80">
                            Continue
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        {isCompleted && (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs text-green-600 hover:text-green-700">
                            Review
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={handleNewProject}
                  className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect"
                >
                  Start a New Learning Project
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
