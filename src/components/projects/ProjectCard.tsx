import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    
    // Check if the project is approved to determine navigation path
    if (project.is_approved) {
      // If approved, navigate directly to the first step of the content
      navigate(`/content/${project.id}/step/0`);
    } else {
      // If not approved yet, navigate to the plan page
      navigate("/plan");
      // Store path ID for plan page
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
        className="h-full overflow-hidden bg-white border border-gray-100 hover:border-[#6654f5]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#6654f5]/10 group cursor-pointer"
        onClick={() => handleProjectClick(project)}
      >
        {/* Gradient accent bar at top */}
        <div className="h-1 brand-gradient" />

        <CardHeader className="pb-4 relative">
          {/* Status Badge */}
          <div className="flex justify-between items-start mb-3">
            <ProjectStatusLabel project={project} />
            <div className="flex items-center gap-2">
              {!project.id.startsWith('demo-') && (
                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteProjectDialog
                    projectId={project.id}
                    projectTopic={project.topic}
                    onDeleteProject={onDeleteProject}
                    isDeleting={isDeleting}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-[#0b0c18] text-lg leading-tight mb-1 group-hover:text-[#6654f5] transition-colors duration-300">
                  {project.topic}
                </h3>
                <div className="text-xs text-gray-500">
                  <span>Started {formatDate(project.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#0b0c18]">
                Progress
              </span>
              <div className="flex items-center">
                {isCompleted ? (
                  <span className="text-sm font-semibold text-[#6654f5]">Complete</span>
                ) : (
                  <span className="text-sm font-semibold text-[#0b0c18]">
                    {project.progress || 0}%
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <Progress
                value={isCompleted ? 100 : (project.progress || 0)}
                className="h-3 bg-gray-100"
                indicatorClassName={isCompleted ? "brand-gradient" : "bg-gradient-to-r from-[#ca5a8b] to-[#f2b347]"}
              />
            </div>
          </div>

          {/* Learning metrics */}
          {project.description && (
            <p className="text-sm text-gray-600 mt-4 line-clamp-2">
              {project.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-4 pb-5 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="w-full group/btn relative overflow-hidden"
            onClick={(e) => {
              e.stopPropagation();
              handleProjectClick(project);
            }}
          >
            <div className="absolute inset-0 brand-gradient opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
            <span className="relative font-medium text-[#6654f5] group-hover/btn:text-[#6654f5]">
              {isCompleted ? 'Review Project' : 'Continue Learning'}
            </span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
