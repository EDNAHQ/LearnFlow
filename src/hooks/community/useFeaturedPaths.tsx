import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/ui/use-toast";

export interface FeaturedPath {
  id: string;
  topic: string;
  title: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  published_at: string | null;
  view_count: number | null;
  like_count: number | null;
  fork_count: number | null;
  tags: string[] | null;
  is_featured: boolean;
  featured_at: string | null;
  difficulty_level: string | null;
  estimated_hours: number | null;
  category: string | null;
  profile: {
    username: string | null;
  } | null;
}

export const useFeaturedPaths = () => {
  const [featuredPaths, setFeaturedPaths] = useState<FeaturedPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedPaths();
  }, []);

  const fetchFeaturedPaths = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("learning_paths")
        .select(`
          *,
          profile:profiles!learning_paths_user_id_fkey (
            username
          )
        `)
        .eq("is_featured", true)
        .eq("is_public", true)
        .order("featured_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching featured paths:", error);
        toast({
          title: "Error loading featured paths",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setFeaturedPaths(data || []);
    } catch (error) {
      console.error("Error in fetchFeaturedPaths:", error);
      toast({
        title: "Error loading featured paths",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    featuredPaths,
    isLoading,
    refetch: fetchFeaturedPaths,
  };
};
