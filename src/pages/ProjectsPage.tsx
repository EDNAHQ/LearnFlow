
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowLeft, Book, Clock, ExternalLink, Trophy, CheckCircle } from "lucide-react";
import { UserNav } from "@/components/UserNav";
import { toast } from "sonner";

interface LearningProject {
  id: string;
  topic: string;
  created_at: string;
  is_approved: boolean;
  is_completed?: boolean; // Optional since it might not exist in the database
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
        // First, fetch base project data without is_completed
        const { data, error } = await supabase
          .from('learning_paths')
          .select('id, topic, created_at, is_approved')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching learning projects:", error);
          toast.error("Failed to load your learning projects");
          return;
        }

        // Check if we got data back
        if (!data || !Array.isArray(data)) {
          setProjects([]);
          setLoading(false);
          return;
        }

        // Create base projects with progress info
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
                is_completed: false // Default to false
              };
            }

            const completedSteps = steps ? steps.filter(step => step.completed).length : 0;
            const totalSteps = steps ? steps.length : 0;
            const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

            return {
              ...project,
              progress,
              is_completed: false // Default to false
            };
          })
        );

        // Try to check if is_completed column exists
        try {
          // Safely check if the is_completed column exists
          const testQuery = await supabase
            .from('learning_paths')
            .select('is_completed')
            .limit(1);
          
          // If no error, the column exists so we can use it
          if (!testQuery.error && projectsWithProgress.length > 0) {
            // Get the IDs of all projects we need to update
            const projectIds = projectsWithProgress.map(p => p.id);
            
            // Get completion status for all these projects in one query
            const { data: completionData, error: completionError } = await supabase
              .from('learning_paths')
              .select('id, is_completed')
              .in('id', projectIds);
            
            if (!completionError && completionData) {
              // Map completion status to projects
              projectsWithProgress.forEach(project => {
                const completionInfo = completionData.find(p => p.id === project.id);
                if (completionInfo && completionInfo.is_completed) {
                  project.is_completed = completionInfo.is_completed;
                }
              });
            }
          }
        } catch (error) {
          // Just log the error - we'll use the default false values for is_completed
          console.log("is_completed column might not exist:", error);
        }

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
    // Don't allow clicking on completed projects
    if (project.is_completed) {
      toast.info("This project is already completed");
      return;
    }
    
    // Store project details in session storage
    sessionStorage.setItem("learn-topic", project.topic);
    sessionStorage.setItem("learning-path-id", project.id);

    // Navigate to the appropriate page
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
    if (project.is_approved) return { label: 'In Progress', bgColor: 'bg-blue-100 text-blue-800' };
    return { label: 'Plan Created', bgColor: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-6">
      <div className="absolute top-4 right-4">
        <UserNav />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button 
            variant="ghost" 
            className="flex items-center gap-1" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">LearnFlow</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Learning Projects</h1>
            <p className="text-muted-foreground">
              Review and continue your learning journey
            </p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-learn-200 border-t-learn-500 animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-xl">
              <Book className="w-12 h-12 mx-auto mb-4 text-learn-500 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No learning projects yet</h3>
              <p className="text-muted-foreground mb-6">Start your learning journey by creating your first project</p>
              <Button onClick={handleNewProject} className="bg-learn-600 hover:bg-learn-700">
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
                      className={`glass-panel p-5 rounded-xl hover:shadow-md transition-all ${isCompleted ? 'bg-green-50' : 'cursor-pointer'}`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">
                          {isCompleted && (
                            <CheckCircle className="inline-block w-4 h-4 text-green-600 mr-1" />
                          )}
                          {project.topic}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="h-2 w-full bg-gray-100 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-learn-500'}`} 
                            style={{ width: `${isCompleted ? 100 : (project.progress || 0)}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {isCompleted ? '100% complete' : `${project.progress || 0}% complete`}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className={`inline-block py-1 px-2 rounded-full text-xs ${status.bgColor}`}>
                            {status.label}
                          </span>
                        </div>
                        {!isCompleted && (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            Continue
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        {isCompleted && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Completed
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={handleNewProject}
                  className="bg-learn-600 hover:bg-learn-700"
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
