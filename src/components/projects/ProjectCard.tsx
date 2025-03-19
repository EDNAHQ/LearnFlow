
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DeleteProjectDialog from "./DeleteProjectDialog";
import ProjectStatusLabel from "./ProjectStatusLabel";
import { ProjectCardProps } from "./types";
import { getProjectStyling, formatDate } from "./projectStylingUtils";

export const ProjectCard = ({ project, onDeleteProject, isDeleting }: ProjectCardProps) => {
  const navigate = useNavigate();
  
  const handleProjectClick = (project: ProjectCardProps['project']) => {
    // Store topic for reference (still useful for components that need it)
    sessionStorage.setItem("learn-topic", project.topic);
    
    // Navigate to the new URL structure instead of just setting sessionStorage
    if (project.is_approved) {
      navigate(`/content/${project.id}`);
    } else {
      navigate("/plan");
      // Still need to store path ID for plan page
      sessionStorage.setItem("learning-path-id", project.id);
    }
  };

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
        className={`h-full overflow-hidden transition-all duration-300 hover:translate-y-[-4px] bg-gradient-to-br ${styling.color} backdrop-blur-sm ${styling.border} hover:shadow-brand`}
      >
        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-start">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => handleProjectClick(project)}
            >
              <div className="flex items-center space-x-2 mr-2">
                <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full border border-white/50 shadow-sm">
                  {styling.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  {isCompleted && (
                    <CheckCircle className="inline-block w-4 h-4 text-brand-purple mr-1.5" />
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
              <DeleteProjectDialog 
                projectId={project.id}
                projectTopic={project.topic}
                onDeleteProject={onDeleteProject}
                isDeleting={isDeleting}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="mb-2">
            <Progress 
              value={isCompleted ? 100 : (project.progress || 0)} 
              className="h-2 bg-white/50 backdrop-blur-sm" 
              indicatorClassName={isCompleted ? "bg-brand-purple" : "bg-brand-pink"}
            />
            <div className="mt-1 text-xs text-gray-500 flex justify-between">
              <span>{isCompleted ? '100% complete' : `${project.progress || 0}% complete`}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="text-sm">
            <ProjectStatusLabel project={project} />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1 text-xs ${isCompleted ? 'text-brand-purple hover:text-brand-purple/80' : 'text-brand-pink hover:text-brand-pink/80'}`}
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
