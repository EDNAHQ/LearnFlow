import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, TrendingUp, Heart, Eye, GitFork, Sparkles } from 'lucide-react';

interface PulseStats {
  pathsToday: number;
  activeLearners: number;
  totalViews: number;
  totalLikes: number;
  totalForks: number;
  trendingGrowth: number;
}

export const CommunityPulse = () => {
  const [stats, setStats] = useState<PulseStats>({
    pathsToday: 0,
    activeLearners: 0,
    totalViews: 0,
    totalLikes: 0,
    totalForks: 0,
    trendingGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState<PulseStats>(stats);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        pathsToday: Math.floor(stats.pathsToday * easeOut),
        activeLearners: Math.floor(stats.activeLearners * easeOut),
        totalViews: Math.floor(stats.totalViews * easeOut),
        totalLikes: Math.floor(stats.totalLikes * easeOut),
        totalForks: Math.floor(stats.totalForks * easeOut),
        trendingGrowth: Math.floor(stats.trendingGrowth * easeOut)
      });

      if (currentStep < steps) {
        setTimeout(animate, stepDuration);
      } else {
        setAnimatedStats(stats);
      }
    };

    if (!isLoading) {
      animate();
    }
  }, [stats, isLoading]);

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: pathsToday, error: pathsError } = await supabase
        .from('learning_paths')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true)
        .gte('published_at', today.toISOString());

      if (pathsError) throw pathsError;

      const { data: allPaths, error: allPathsError } = await supabase
        .from('learning_paths')
        .select('view_count, like_count, fork_count')
        .eq('is_public', true);

      if (allPathsError) throw allPathsError;

      const totalViews = allPaths?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      const totalLikes = allPaths?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0;
      const totalForks = allPaths?.reduce((sum, p) => sum + (p.fork_count || 0), 0) || 0;

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: pathsYesterday, error: yesterdayError } = await supabase
        .from('learning_paths')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true)
        .gte('published_at', yesterday.toISOString())
        .lt('published_at', today.toISOString());

      if (yesterdayError) throw yesterdayError;

      const yesterdayCount = pathsYesterday?.length || 0;
      const todayCount = pathsToday?.length || 0;
      const growth = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : 0;

      const { data: recentInteractions, error: interactionsError } = await supabase
        .from('path_interactions')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (interactionsError) throw interactionsError;

      const uniqueUsers = new Set(recentInteractions?.map(i => i.user_id) || []);

      setStats({
        pathsToday: todayCount,
        activeLearners: uniqueUsers.size,
        totalViews,
        totalLikes,
        totalForks,
        trendingGrowth: growth
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Paths Today',
      value: animatedStats.pathsToday,
      icon: BookOpen,
      color: 'from-brand-purple to-brand-pink',
      suffix: ''
    },
    {
      label: 'Active Learners',
      value: animatedStats.activeLearners,
      icon: Users,
      color: 'from-brand-pink to-brand-gold',
      suffix: ''
    },
    {
      label: 'Total Views',
      value: animatedStats.totalViews,
      icon: Eye,
      color: 'from-brand-purple to-brand-gold',
      suffix: animatedStats.totalViews >= 1000 ? 'K' : ''
    },
    {
      label: 'Total Likes',
      value: animatedStats.totalLikes,
      icon: Heart,
      color: 'from-brand-pink to-brand-purple',
      suffix: animatedStats.totalLikes >= 1000 ? 'K' : ''
    },
    {
      label: 'Total Forks',
      value: animatedStats.totalForks,
      icon: GitFork,
      color: 'from-brand-gold to-brand-pink',
      suffix: ''
    },
    {
      label: 'Growth',
      value: Math.abs(animatedStats.trendingGrowth),
      icon: TrendingUp,
      color: animatedStats.trendingGrowth >= 0 ? 'from-brand-gold to-brand-purple' : 'from-brand-pink to-brand-purple',
      suffix: '%',
      prefix: animatedStats.trendingGrowth >= 0 ? '+' : '-'
    }
  ];

  const formatValue = (value: number, suffix: string, prefix: string = '') => {
    if (value >= 1000 && suffix === 'K') {
      return `${prefix}${(value / 1000).toFixed(1)}${suffix}`;
    }
    return `${prefix}${value}${suffix}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-brand-black">Community Pulse</h3>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 bg-brand-pink rounded-full"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-2 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-brand-purple/20 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-3 h-3 mb-1 rounded bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-2 h-2 text-white" />
                  </div>
                  <p className={`text-sm font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {formatValue(stat.value, stat.suffix, stat.prefix)}
                  </p>
                  <p className="text-[10px] text-brand-black/50 mt-0.5">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

