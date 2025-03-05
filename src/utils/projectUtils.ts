
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes a learning path and all associated steps
 * @param pathId The ID of the learning path to delete
 * @returns A promise that resolves to true if deletion was successful, false otherwise
 */
export const deleteLearningPath = async (pathId: string): Promise<boolean> => {
  if (!pathId) {
    toast.error("No project ID provided");
    return false;
  }
  
  try {
    // First check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You need to be logged in to delete projects");
      return false;
    }
    
    // First delete all learning steps associated with this path
    const { error: stepsError } = await supabase
      .from('learning_steps')
      .delete()
      .eq('path_id', pathId);
      
    if (stepsError) {
      console.error("Error deleting learning steps:", stepsError);
      toast.error("Failed to delete learning steps");
      return false;
    }
    
    // Then delete the learning path itself
    const { error: pathError } = await supabase
      .from('learning_paths')
      .delete()
      .eq('id', pathId);
      
    if (pathError) {
      console.error("Error deleting learning path:", pathError);
      toast.error("Failed to delete learning path");
      return false;
    }
    
    toast.success("Project deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteLearningPath:", error);
    toast.error("Something went wrong while deleting the project");
    return false;
  }
};
