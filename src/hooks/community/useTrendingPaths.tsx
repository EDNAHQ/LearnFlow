import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/ui/use-toast";
import { getTopTrending } from "@/utils/trendingScore";

export interface TrendingPath {
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
  difficulty_level: string | null;
  category: string | null;
  profile: {
    username: string | null;
  } | null;
}

export const useTrendingPaths = (limit: number = 5) => {
  const [trendingPaths, setTrendingPaths] = useState<TrendingPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendingPaths();
  }, [limit]);

  const fetchTrendingPaths = async () => {
    try {
      setIsLoading(true);

      // Fetch recent public paths with engagement metrics
      const { data, error } = await supabase
        .from("learning_paths")
        .select(`
          *,
          profile:profiles!learning_paths_user_id_fkey (
            username
          )
        `)
        .eq("is_public", true)
        .not("published_at", "is", null)
        .gte("published_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trending paths:", error);
        toast({
          title: "Error loading trending paths",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Calculate trending scores and get top paths
      const topTrending = getTopTrending(data || [], limit, 30);
      setTrendingPaths(topTrending);
    } catch (error) {
      console.error("Error in fetchTrendingPaths:", error);
      toast({
        title: "Error loading trending paths",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    trendingPaths,
    isLoading,
    refetch: fetchTrendingPaths,
  };
};
