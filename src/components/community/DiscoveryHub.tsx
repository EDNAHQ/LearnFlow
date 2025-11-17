import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, Zap } from 'lucide-react';

interface Category {
  name: string;
  count: number;
  trending: boolean;
}

interface TrendingTopic {
  topic: string;
  path_id: string;
  view_count: number;
  like_count: number;
}

export const DiscoveryHub = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDiscoveryData();
  }, []);

  const loadDiscoveryData = async () => {
    try {
      const { data: paths, error } = await supabase
        .from('learning_paths')
        .select('category, topic, id, view_count, like_count')
        .eq('is_public', true);

      if (error) throw error;

      const categoryMap = new Map<string, number>();
      paths?.forEach(path => {
        if (path.category) {
          categoryMap.set(path.category, (categoryMap.get(path.category) || 0) + 1);
        }
      });

      const categoryList: Category[] = Array.from(categoryMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          trending: count >= 3
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setCategories(categoryList);

      const topicsMap = new Map<string, { path_id: string; view_count: number; like_count: number }>();
      paths?.forEach(path => {
        const existing = topicsMap.get(path.topic);
        if (!existing || (path.view_count + path.like_count) > (existing.view_count + existing.like_count)) {
          topicsMap.set(path.topic, {
            path_id: path.id,
            view_count: path.view_count || 0,
            like_count: path.like_count || 0
          });
        }
      });

      const trending = Array.from(topicsMap.entries())
        .map(([topic, data]) => ({
          topic,
          ...data
        }))
        .sort((a, b) => (b.view_count + b.like_count) - (a.view_count + a.like_count))
        .slice(0, 6);

      setTrendingTopics(trending);
    } catch (error) {
      console.error('Error loading discovery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    navigate(`/community?category=${encodeURIComponent(category)}`);
  };

  const handleTopicClick = (pathId: string) => {
    navigate(`/content/${pathId}/step/0`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-brand-gold to-brand-pink">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-brand-black">Discover</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="space-y-1.5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 4).map((category, index) => (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`relative px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white'
                      : category.trending
                      ? 'bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 text-brand-purple border border-brand-purple/20'
                      : 'bg-gray-100 text-brand-black'
                  }`}
                >
                  {category.trending && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand-gold rounded-full"
                    />
                  )}
                  <span className="truncate">{category.name}</span>
                </motion.button>
              ))}
            </div>
          )}
          {trendingTopics.length > 0 && (
            <div className="space-y-1">
              {trendingTopics.slice(0, 3).map((topic, index) => (
                <motion.div
                  key={topic.path_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleTopicClick(topic.path_id)}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-gradient-to-r from-brand-purple/5 to-brand-pink/5 hover:from-brand-purple/10 hover:to-brand-pink/10 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-gradient-to-r from-brand-purple to-brand-pink text-white text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-brand-black group-hover:text-brand-purple transition-colors truncate">
                      {topic.topic}
                    </p>
                    <p className="text-[10px] text-brand-black/50">
                      {topic.view_count} views • {topic.like_count} likes
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

