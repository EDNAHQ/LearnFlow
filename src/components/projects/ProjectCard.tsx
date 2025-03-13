
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ExternalLink, CheckCircle, Trash2, Book, Code, FileCode, Beaker, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

interface ProjectCardProps {
  project: {
    id: string;
    topic: string;
    created_at: string;
    is_approved: boolean;
    is_completed: boolean;
    progress?: number;
  };
  onDeleteProject: (id: string) => void;
  isDeleting: boolean;
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

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getProjectStatusLabel = (project: ProjectCardProps['project']) => {
  if (project.is_completed) return { label: 'Completed', bgColor: 'bg-green-100 text-green-800' };
  if (project.is_approved) return { label: 'In Progress', bgColor: 'bg-brand-purple/20 text-brand-purple' };
  return { label: 'Plan Created', bgColor: 'bg-brand-gold/20 text-brand-gold' };
};

export const ProjectCard = ({ project, onDeleteProject, isDeleting }: ProjectCardProps) => {
  const navigate = useNavigate();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const handleProjectClick = (project: ProjectCardProps['project']) => {
    sessionStorage.setItem("learn-topic", project.topic);
    sessionStorage.setItem("learning-path-id", project.id);

    if (project.is_approved) {
      navigate("/content");
    } else {
      navigate("/plan");
    }
  };

  const status = getProjectStatusLabel(project);
  const isCompleted = Boolean(project.is_completed);
  const styling = getProjectStyling(project.topic);
  
  return (
    <motion.div
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
                      onClick={() => {
                        onDeleteProject(project.id);
                        setProjectToDelete(null);
                      }}
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
};

export default ProjectCard;
