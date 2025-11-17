import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles, Heart, GitFork, Eye, BookOpen, TrendingUp } from 'lucide-react';

interface Activity {
  id: string;
  type: 'path_published' | 'like' | 'fork' | 'view';
  path_title: string;
  path_id: string;
  username: string;
  timestamp: string;
}

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
    
    const channel = supabase
      .channel('community-activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_paths',
          filter: 'is_public=eq.true'
        },
        () => {
          loadRecentActivity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'path_interactions'
        },
        () => {
          loadRecentActivity();
        }
      )
      .subscribe();

    const interval = setInterval(loadRecentActivity, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadRecentActivity = async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: recentPaths, error: pathsError } = await supabase
        .from('learning_paths')
        .select(`
          id,
          title,
          topic,
          published_at,
          profile:profiles!learning_paths_user_id_fkey(username)
        `)
        .eq('is_public', true)
        .gte('published_at', oneDayAgo)
        .order('published_at', { ascending: false })
        .limit(5);

      if (pathsError) throw pathsError;

      const { data: recentInteractions, error: interactionsError } = await supabase
        .from('path_interactions')
        .select(`
          id,
          interaction_type,
          created_at,
          path_id,
          user_id,
          learning_paths!path_interactions_path_id_fkey(title, topic),
          profiles!path_interactions_user_id_fkey(username)
        `)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (interactionsError) throw interactionsError;

      const activityList: Activity[] = [];

      recentPaths?.forEach(path => {
        activityList.push({
          id: `path-${path.id}`,
          type: 'path_published',
          path_title: path.title || path.topic,
          path_id: path.id,
          username: (path.profile as any)?.username || 'Anonymous',
          timestamp: path.published_at || new Date().toISOString()
        });
      });

      recentInteractions?.forEach(interaction => {
        if (interaction.interaction_type === 'like' || interaction.interaction_type === 'fork') {
          const pathData = (interaction as any).learning_paths;
          const profileData = (interaction as any).profiles;
          activityList.push({
            id: `interaction-${interaction.id}`,
            type: interaction.interaction_type as 'like' | 'fork',
            path_title: pathData?.title || pathData?.topic || 'Unknown',
            path_id: interaction.path_id,
            username: profileData?.username || 'Anonymous',
            timestamp: interaction.created_at
          });
        }
      });

      activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activityList.slice(0, 8));
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'path_published':
        return <BookOpen className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'fork':
        return <GitFork className="w-4 h-4" />;
      case 'view':
        return <Eye className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'path_published':
        return 'from-brand-purple to-brand-pink';
      case 'like':
        return 'from-brand-pink to-brand-gold';
      case 'fork':
        return 'from-brand-purple to-brand-gold';
      default:
        return 'from-brand-purple to-brand-pink';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-brand-purple to-brand-pink">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-brand-black">Live Activity</h3>
        </div>
        <div className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-4 text-brand-black/60 text-xs">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 opacity-30" />
          <p>No recent activity</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
            {activities.slice(0, 4).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gradient-to-r hover:from-brand-purple/5 hover:to-brand-pink/5 transition-all duration-200"
              >
                <div className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-gradient-to-r ${getActivityColor(activity.type)} text-white`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-black leading-tight">
                    <span className="font-semibold">{activity.username}</span>
                    {' '}
                    {activity.type === 'path_published' && 'published'}
                    {activity.type === 'like' && 'liked'}
                    {activity.type === 'fork' && 'forked'}
                    {' '}
                    <span className="font-medium text-brand-purple truncate block">{activity.path_title}</span>
                  </p>
                  <p className="text-[10px] text-brand-black/50 mt-0.5">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

