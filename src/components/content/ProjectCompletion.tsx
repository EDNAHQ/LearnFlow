import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectCompletionProps {
  pathId: string | null;
  onComplete: () => void;
}

const ProjectCompletion = ({ pathId, onComplete }: ProjectCompletionProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [projectCompleted, setProjectCompleted] = useState<boolean>(false);

  const completePath = async () => {
    if (!pathId) return;
    
    try {
      setIsSubmitting(true);
      
      try {
        const { error: updateError } = await supabase
          .from('learning_paths')
          .update({ is_approved: true })
          .eq('id', pathId);
        
        if (updateError) {
          console.error("Error updating path:", updateError);
        }
      } catch (error) {
        console.error("Error updating path:", error);
      }
      
      // Keep only the final completion toast
      toast.success("Congratulations! Learning project completed! 🎉");
      setProjectCompleted(true);
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Error marking project as complete:", error);
      // Remove error toast
      toast.error("Failed to mark project as complete");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completePath,
    isSubmitting,
    projectCompleted
  };
};

export default ProjectCompletion;
