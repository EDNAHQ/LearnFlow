
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Book, Clock, ExternalLink, Trophy, CheckCircle, Sparkles, Trash2, Code, BookOpen, FileCode, Beaker, GraduationCap } from "lucide-react";
import { MainNav } from "@/components/MainNav";
import { toast } from "sonner";
import { deleteLearningPath } from "@/utils/projectUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LearningProject {
  id: string;
  topic: string;
  created_at: string;
  is_approved: boolean;
  is_completed: boolean;
  progress?: number;
}

// Project topic categories with associated icons and background colors
const projectCategories = {
  "machine learning": { icon: <Beaker className="h-4 w-4" />, color: "from-violet-500/20 to-purple-500/20", border: "border-violet-400" },
  "javascript": { icon: <Code className="h-4 w-4" />, color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-400" },
  "python": { icon: <FileCode className="h-4 w-4" />, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-400" },
  "history": { icon: <BookOpen className="h-4 w-4" />, color: "from-emerald-500/20 to-green-500/20", border: "border-emerald-400" },
  "vba": { icon: <Code className="h-4 w-4" />, color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-400" },
  "api": { icon: <FileCode className="h-4 w-4" />, color: "from-rose-500/20 to-pink-500/20", border: "border-rose-400" },
  "open source": { icon: <Book className="h-4 w-4" />, color: "from-teal-500/20 to-green-500/20", border: "border-teal-400" },
  "github": { icon: <Code className="h-4 w-4" />, color: "from-gray-500/20 to-slate-500/20", border: "border-gray-400" },
  "website": { icon: <GraduationCap className="h-4 w-4" />, color: "from-sky-500/20 to-blue-500/20", border: "border-sky-400" },
};

// Helper function to determine project styling based on topic
const getProjectStyling = (topic: string) => {
  const lowerTopic = topic.toLowerCase();
  
  for (const [key, value] of Object.entries(projectCategories)) {
    if (lowerTopic.includes(key)) {
      return value;
    }
  }
  
  // Default styling if no match
  return { 
    icon: <Book className="h-4 w-4" />, 
    color: "from-brand-purple/20 to-brand-pink/20", 
    border: "border-brand-purple" 
  };
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<LearningProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteProject = async () => {
    if (!projectToDelete) {
      toast.error("No project selected for deletion");
      return;
    }
    
    setIsDeleting(true);
    try {
      const success = await deleteLearningPath(projectToDelete);
      if (success) {
        setProjects(projects.filter(project => project.id !== projectToDelete));
        toast.success("Project deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background pattern elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-brand-gold/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-0"></div>
      
      <MainNav />
      
      <div className="container max-w-5xl mx-auto py-12 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12 text-center relative">
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 z-0"></div>
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
            
            <div className="relative">
              <div className="inline-flex justify-center items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-brand-purple" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-brand-purple">Your Learning Projects</h1>
              <p className="text-gray-600 max-w-lg mx-auto">
                Review and continue your learning journey
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin mb-4"></div>
              <p className="text-gray-500 animate-pulse-soft">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-brand-purple/5 pointer-events-none"></div>
              <div className="relative z-10">
                <Book className="w-16 h-16 mx-auto mb-5 text-brand-purple opacity-50" />
                <h3 className="text-2xl font-medium mb-3">No learning projects yet</h3>
                <p className="text-gray-600 mb-8">Start your learning journey by creating your first project</p>
                <Button 
                  onClick={handleNewProject} 
                  className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect"
                >
                  Create Your First Project
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {projects.map((project) => {
                  const status = getProjectStatusLabel(project);
                  const isCompleted = Boolean(project.is_completed);
                  const styling = getProjectStyling(project.topic);
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="h-full"
                    >
                      <Card 
                        className={`h-full overflow-hidden transition-all duration-300 bg-gradient-to-br ${styling.color} border ${styling.border} hover:shadow-lg`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div 
                              className="flex items-center cursor-pointer" 
                              onClick={() => handleProjectClick(project)}
                            >
                              <div className="flex items-center space-x-2 mr-2">
                                <div className="bg-white/60 backdrop-blur-sm p-1.5 rounded-full">
                                  {styling.icon}
                                </div>
                                <h3 className="text-lg font-medium text-gray-800">
                                  {isCompleted && (
                                    <CheckCircle className="inline-block w-4 h-4 text-green-600 mr-1.5" />
                                  )}
                                  {project.topic}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{formatDate(project.created_at)}</span>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-7 h-7 rounded-full text-gray-400 hover:text-brand-pink hover:bg-brand-pink/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setProjectToDelete(project.id);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Learning Project</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{project.topic}" and all its content.
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                                      onClick={handleDeleteProject}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? "Deleting..." : "Delete Project"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          <div className="mb-2">
                            <Progress 
                              value={isCompleted ? 100 : (project.progress || 0)} 
                              className="h-2 bg-gray-200" 
                              indicatorClassName={isCompleted ? "bg-green-500" : "bg-brand-purple"}
                            />
                            <div className="mt-1 text-xs text-gray-500 flex justify-between">
                              <span>{isCompleted ? '100% complete' : `${project.progress || 0}% complete`}</span>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between items-center pt-0">
                          <div className="text-sm">
                            <span className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${status.bgColor}`}>
                              {status.label}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`gap-1 text-xs ${isCompleted ? 'text-green-600 hover:text-green-700' : 'text-brand-purple hover:text-brand-purple/80'}`}
                            onClick={() => handleProjectClick(project)}
                          >
                            {isCompleted ? 'Review' : 'Continue'}
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </CardFooter>
                      </Card>
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
      
      <AlertDialog open={!!projectToDelete && !isDeleting}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Learning Project</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all its content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-brand-pink hover:bg-brand-pink/90 text-white"
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsPage;
