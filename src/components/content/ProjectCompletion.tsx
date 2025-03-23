
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Separate the logic into a custom hook that can be used anywhere
export const useProjectCompletion = (pathId: string | null, onComplete?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [projectCompleted, setProjectCompleted] = useState<boolean>(false);

  const completePath = async () => {
    if (!pathId) return;
    
    try {
      setIsSubmitting(true);
      
      // First update the learning paths table
      const { error: updateError } = await supabase
        .from('learning_paths')
        .update({ 
          is_approved: true, 
          is_completed: true 
        })
        .eq('id', pathId);
      
      if (updateError) {
        console.error("Error updating path:", updateError);
        console.log("Failed to complete project");
        return false;
      }
      
      console.log("Congratulations! Learning project completed! 🎉");
      setProjectCompleted(true);
      
      // Call onComplete if provided
      if (onComplete) {
        onComplete();
      }
      
      return true;
    } catch (error) {
      console.error("Error marking project as complete:", error);
      console.log("Failed to mark project as complete");
      return false;
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

// Keep the component for backward compatibility
interface ProjectCompletionProps {
  pathId: string | null;
  onComplete: () => void;
}

const ProjectCompletion = ({ pathId, onComplete }: ProjectCompletionProps) => {
  // Use our custom hook
  const projectCompletionState = useProjectCompletion(pathId, onComplete);
  
  // Return the hook's state and functions
  return projectCompletionState;
};

export default ProjectCompletion;
