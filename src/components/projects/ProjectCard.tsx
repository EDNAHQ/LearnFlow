import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import DeleteProjectDialog from "./DeleteProjectDialog";
import ProjectStatusLabel from "./ProjectStatusLabel";
import RelatedTopicsModal from "./RelatedTopicsModal";
import { ProjectCardProps } from "./types";
import { getProjectStyling, formatDate } from "./projectStylingUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useBehaviorTracking } from "@/hooks/analytics";
import { useAuth } from "@/hooks/auth";

export const ProjectCard = ({ project, onDeleteProject, isDeleting }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackClick } = useBehaviorTracking();
  const { user } = useAuth();
  const [showRelatedTopics, setShowRelatedTopics] = useState(false);
  const [isPublic, setIsPublic] = useState(project.is_public || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePrivacyToggle = async (checked: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('learning_paths')
        .update({
          is_public: checked,
          published_at: checked ? new Date().toISOString() : null
        })
        .eq('id', project.id);

      if (error) throw error;

      setIsPublic(checked);
      toast({
        title: checked ? "Path made public" : "Path made private",
        description: checked
          ? "Your learning path is now visible to the community"
          : "Your learning path is now private",
      });
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast({
        title: "Error updating privacy",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProjectClick = (project: ProjectCardProps['project']) => {
    // Track project click - critical for understanding what users want to learn
    trackClick(`project-${project.id}`, 'project');

    // If user is not logged in, redirect to sign in (demo projects can't be accessed)
    if (!user) {
      navigate("/sign-in");
      return;
    }

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
          {/* Status Badge and Privacy Toggle */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <ProjectStatusLabel project={project} />
              {project.is_approved && !project.id.startsWith('demo-') && (
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-gray-500 font-medium">Private</span>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={handlePrivacyToggle}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-[#6654f5]"
                  />
                  <span className="text-xs text-gray-500 font-medium">Public</span>
                </div>
              )}
            </div>
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
                <h3 className="font-semibold text-[#0b0c18] text-base sm:text-lg leading-tight mb-1 group-hover:text-[#6654f5] transition-colors duration-300 line-clamp-2">
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

          {/* Community metrics if public */}
          {isPublic && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium">Views:</span>
                <span className="text-xs text-gray-600 font-semibold">{project.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium">Likes:</span>
                <span className="text-xs text-gray-600 font-semibold">{project.like_count || 0}</span>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-4 pb-5 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowRelatedTopics(true);
              }}
              className="relative px-3 py-2 text-xs font-medium text-[#6654f5] border-[#6654f5]/20 hover:border-[#6654f5]/40 hover:bg-[#6654f5]/5 transition-all duration-300"
            >
              New Topics
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 group/btn relative overflow-hidden"
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
          </div>
        </CardFooter>
      </Card>

      {/* Related Topics Modal */}
      <RelatedTopicsModal
        isOpen={showRelatedTopics}
        onClose={() => setShowRelatedTopics(false)}
        projectTitle={project.topic}
        projectDescription={project.description}
      />
    </motion.div>
  );
};

export default ProjectCard;
