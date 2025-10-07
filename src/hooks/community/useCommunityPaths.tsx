import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface CommunityPath {
  id: string;
  topic: string;
  title: string | null;
  created_at: string;
  published_at: string | null;
  is_completed: boolean;
  view_count: number;
  like_count: number;
  fork_count: number;
  user_id: string;
  tags: string[] | null;
  profile?: {
    username: string | null;
  };
  user_liked?: boolean;
}

interface UseCommunityPathsOptions {
  sortBy?: 'recent' | 'popular' | 'views';
  searchQuery?: string;
  userId?: string;
}

export const useCommunityPaths = (options: UseCommunityPathsOptions = {}) => {
  const { toast } = useToast();
  const [paths, setPaths] = useState<CommunityPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { sortBy = 'recent', searchQuery = '', userId } = options;

  useEffect(() => {
    loadCommunityPaths();
  }, [sortBy, searchQuery]);

  const loadCommunityPaths = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('learning_paths')
        .select(`
          *,
          profile:profiles!learning_paths_user_id_fkey (
            username
          )
        `)
        .eq('is_public', true);

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.order('published_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('like_count', { ascending: false });
          break;
        case 'views':
          query = query.order('view_count', { ascending: false });
          break;
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`topic.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Check if current user has liked each path
      if (userId && data) {
        const pathIds = data.map(p => p.id);
        const { data: interactions } = await supabase
          .from('path_interactions')
          .select('path_id')
          .eq('user_id', userId)
          .eq('interaction_type', 'like')
          .in('path_id', pathIds);

        const likedPaths = new Set(interactions?.map(i => i.path_id) || []);

        setPaths(data.map(path => ({
          ...path,
          user_liked: likedPaths.has(path.id)
        })));
      } else {
        setPaths(data || []);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error loading community paths:', error);
      setError(error);
      toast({
        title: "Error loading community paths",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (pathId: string): Promise<boolean> => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like learning paths",
      });
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        path_id_param: pathId,
        user_id_param: userId
      });

      if (error) throw error;

      // Update local state
      setPaths(prev => prev.map(path => {
        if (path.id === pathId) {
          return {
            ...path,
            user_liked: data,
            like_count: data ? path.like_count + 1 : Math.max(0, path.like_count - 1)
          };
        }
        return path;
      }));

      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error toggling like:', error);
      toast({
        title: "Error updating like",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const incrementViewCount = async (pathId: string): Promise<void> => {
    if (!userId) return;

    try {
      await supabase.rpc('increment_view_count', {
        path_id_param: pathId,
        viewer_id: userId
      });

      // Update local state
      setPaths(prev => prev.map(path => {
        if (path.id === pathId) {
          return {
            ...path,
            view_count: path.view_count + 1
          };
        }
        return path;
      }));
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const forkPath = async (pathId: string): Promise<string | null> => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to fork learning paths",
      });
      return null;
    }

    try {
      // Get the original path
      const { data: originalPath, error: fetchError } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();

      if (fetchError) throw fetchError;

      // Create a forked copy
      const { data: newPath, error: createError } = await supabase
        .from('learning_paths')
        .insert({
          topic: originalPath.topic,
          title: originalPath.title ? `${originalPath.title} (Fork)` : null,
          user_id: userId,
          forked_from_id: pathId,
          is_public: false,
          is_approved: false
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy learning steps
      const { data: steps, error: stepsError } = await supabase
        .from('learning_steps')
        .select('*')
        .eq('path_id', pathId);

      if (stepsError) throw stepsError;

      if (steps && steps.length > 0) {
        const newSteps = steps.map(step => ({
          ...step,
          id: undefined,
          path_id: newPath.id,
          created_at: undefined,
          updated_at: undefined
        }));

        const { error: insertStepsError } = await supabase
          .from('learning_steps')
          .insert(newSteps);

        if (insertStepsError) throw insertStepsError;
      }

      // Track fork interaction
      await supabase
        .from('path_interactions')
        .insert({
          path_id: pathId,
          user_id: userId,
          interaction_type: 'fork'
        });

      // Update fork count
      setPaths(prev => prev.map(path => {
        if (path.id === pathId) {
          return {
            ...path,
            fork_count: path.fork_count + 1
          };
        }
        return path;
      }));

      toast({
        title: "Path forked successfully",
        description: "You can now customize your own version of this learning path",
      });

      return newPath.id;
    } catch (err) {
      const error = err as Error;
      console.error('Error forking path:', error);
      toast({
        title: "Error forking path",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    paths,
    loading,
    error,
    toggleLike,
    incrementViewCount,
    forkPath,
    refetch: loadCommunityPaths
  };
};