import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrendingPaths } from '@/hooks/community/useTrendingPaths';
import { useNavigate } from 'react-router-dom';
import { Flame, Eye, Heart, TrendingUp, Loader2 } from 'lucide-react';

interface TrendingWidgetProps {
  limit?: number;
}

export const TrendingWidget: React.FC<TrendingWidgetProps> = ({ limit = 5 }) => {
  const { trendingPaths, isLoading } = useTrendingPaths(limit);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0b0c18]">Trending Now</h3>
          <p className="text-xs text-[#0b0c18]/60">Hot topics this week</p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#6654f5]" />
        </div>
      )}

      {/* Trending paths list */}
      {!isLoading && trendingPaths.length > 0 && (
        <AnimatePresence>
          <div className="space-y-3">
            {trendingPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/content/${path.id}/step/0`)}
              >
                <div className="p-3 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-[#6654f5]/5 hover:to-[#ca5a8b]/5 transition-all duration-300 border border-transparent hover:border-[#6654f5]/20">
                  {/* Rank badge */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h4 className="text-sm font-semibold text-[#0b0c18] mb-1 line-clamp-2 group-hover:text-[#6654f5] transition-colors">
                        {path.title || path.topic}
                      </h4>

                      {/* Category */}
                      {path.category && (
                        <span className="inline-block text-xs text-[#0b0c18]/60 mb-2">
                          {path.category}
                        </span>
                      )}

                      {/* Metrics */}
                      <div className="flex items-center gap-3 text-xs text-[#0b0c18]/50">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {path.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {path.like_count || 0}
                        </span>
                      </div>
                    </div>

                    {/* Trending indicator */}
                    <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Empty state */}
      {!isLoading && trendingPaths.length === 0 && (
        <div className="text-center py-8 text-[#0b0c18]/60 text-sm">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No trending paths yet</p>
          <p className="text-xs mt-1">Check back soon!</p>
        </div>
      )}

      {/* Footer CTA */}
      {!isLoading && trendingPaths.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => navigate('/community')}
            className="w-full py-2 text-sm font-medium text-[#6654f5] hover:text-[#ca5a8b] transition-colors flex items-center justify-center gap-2"
          >
            View All Community Paths
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TrendingWidget;
