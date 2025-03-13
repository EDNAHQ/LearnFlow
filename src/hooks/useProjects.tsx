
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { deleteLearningPath } from "@/utils/projectUtils";

export interface LearningProject {
  id: string;
  topic: string;
  created_at: string;
  is_approved: boolean;
  is_completed: boolean;
  progress?: number;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<LearningProject[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      const success = await deleteLearningPath(projectId);
      if (success) {
        setProjects(projects.filter(project => project.id !== projectId));
        toast.success("Project deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    projects,
    loading,
    isDeleting,
    handleDeleteProject
  };
};
