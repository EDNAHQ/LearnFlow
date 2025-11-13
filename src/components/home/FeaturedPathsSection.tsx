import React from 'react';
import { motion } from 'framer-motion';
import { useFeaturedPaths } from '@/hooks/community/useFeaturedPaths';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Eye, Heart, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const FeaturedPathsSection = () => {
  const { featuredPaths, isLoading } = useFeaturedPaths();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#6654f5]" />
          </div>
        </div>
      </section>
    );
  }

  if (!featuredPaths || featuredPaths.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6654f5] rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ca5a8b] rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6">
            <Star className="w-4 h-4 text-[#f2b347] fill-[#f2b347]" />
            <span className="text-sm font-medium text-[#6654f5]">Curated Learning</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-[#0b0c18]">Featured</span>{' '}
            <span className="text-gradient">Learning Paths</span>
          </h2>
          <p className="text-xl text-[#0b0c18]/70 max-w-3xl mx-auto">
            Expert-curated paths to help you master the most in-demand skills
            and stay ahead in your career.
          </p>
        </div>

        {/* Featured paths grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              onClick={() => navigate(`/content/${path.id}/step/0`)}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 brand-gradient-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative p-6">
                {/* Featured badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] text-white text-xs font-medium shadow-sm">
                    <Star className="w-3 h-3 fill-white" />
                    Featured
                  </span>
                  {path.difficulty_level && (
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      {path.difficulty_level.charAt(0).toUpperCase() + path.difficulty_level.slice(1)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[#0b0c18] mb-2 line-clamp-2">
                  {path.title || path.topic}
                </h3>

                {/* Category & Time */}
                <div className="flex items-center gap-4 mb-4 text-sm text-[#0b0c18]/60">
                  {path.category && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {path.category}
                    </span>
                  )}
                  {path.estimated_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {path.estimated_hours}h
                    </span>
                  )}
                </div>

                {/* Author */}
                <div className="mb-4 text-sm text-[#0b0c18]/60">
                  by {path.profile?.username || 'Anonymous'}
                </div>

                {/* Engagement metrics */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-sm text-[#0b0c18]/60">
                    <Eye className="w-4 h-4" />
                    {path.view_count || 0}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-[#0b0c18]/60">
                    <Heart className="w-4 h-4" />
                    {path.like_count || 0}
                  </span>
                </div>

                {/* Hover accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 brand-gradient transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA to browse more */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/community')}
            className="inline-flex items-center gap-2 px-8 py-4 brand-gradient text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Browse All Learning Paths
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPathsSection;
