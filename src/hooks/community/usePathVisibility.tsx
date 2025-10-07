import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePathVisibility = (pathId: string, initialIsPublic: boolean = false) => {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateVisibility = async (makePublic: boolean): Promise<boolean> => {
    if (isUpdating) return false;

    setIsUpdating(true);
    try {
      const updateData: any = {
        is_public: makePublic,
      };

      // Set published_at timestamp when making public for the first time
      if (makePublic) {
        const { data: currentPath } = await supabase
          .from('learning_paths')
          .select('published_at')
          .eq('id', pathId)
          .single();

        if (!currentPath?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('learning_paths')
        .update(updateData)
        .eq('id', pathId);

      if (error) throw error;

      setIsPublic(makePublic);

      toast({
        title: makePublic ? "Path made public" : "Path made private",
        description: makePublic
          ? "Your learning path is now visible to the community"
          : "Your learning path is now private",
      });

      return true;
    } catch (error) {
      console.error('Error updating path visibility:', error);
      toast({
        title: "Error updating visibility",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleVisibility = () => updateVisibility(!isPublic);

  return {
    isPublic,
    isUpdating,
    updateVisibility,
    toggleVisibility
  };
};