import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import JourneyLoadingAnimation from '../JourneyLoadingAnimation';
import { Search } from 'lucide-react';
import { useUserProfile } from '../../../hooks/profile/useUserProfile';

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
  careerPaths: string[];
  trending: boolean;
  matchScore: number;
}

interface TopicExplorationProps {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
  onStartLearning?: (topic: Topic) => void;
  selectedTopic: Topic | null;
  isLoading: boolean;
}

const TopicExploration: React.FC<TopicExplorationProps> = ({
  topics,
  onSelect,
  onStartLearning,
  selectedTopic,
  isLoading
}) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const { profile } = useUserProfile();

  // Filter and sort topics - use safe defaults
  const safeTopics = Array.isArray(topics) ? topics : [];
  
  const filteredTopics = useMemo(() => {
    let filtered = safeTopics;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(query) ||
        topic.description?.toLowerCase().includes(query)
      );
    }
    
    // Sort by match score (if available) or alphabetically
    return filtered.sort((a, b) => {
      if (a.matchScore && b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.title.localeCompare(b.title);
    });
  }, [safeTopics, searchQuery]);

  // Get recommended topics - enhanced with profile-based matching
  const recommendedTopics = useMemo(() => {
    let recommended = filteredTopics.filter(t => t.matchScore && t.matchScore >= 75);
    
    // Boost topics that match user's skills/goals
    if (profile) {
      recommended = recommended.map(topic => {
        let boost = 0;
        const titleLower = topic.title.toLowerCase();
        
        // Match based on skill levels
        if (profile.skill_data && titleLower.includes('data')) boost += profile.skill_data;
        if (profile.skill_apps && (titleLower.includes('app') || titleLower.includes('development'))) boost += profile.skill_apps;
        if (profile.skill_automation && (titleLower.includes('automation') || titleLower.includes('workflow'))) boost += profile.skill_automation;
        
        // Match based on goals
        if (profile.goals_short_term && titleLower.includes(profile.goals_short_term.toLowerCase().slice(0, 10))) boost += 10;
        if (profile.immediate_challenge && titleLower.includes(profile.immediate_challenge.toLowerCase().slice(0, 10))) boost += 15;
        
        return { ...topic, matchScore: (topic.matchScore || 80) + boost };
      }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
    
    return recommended.slice(0, 6);
  }, [filteredTopics, profile]);

  // NOW we can do early returns
  if (isLoading) {
    return (
      <JourneyLoadingAnimation
        message="Discovering perfect topics for you"
        subMessage="Analyzing your interests to find the best learning paths..."
      />
    );
  }

  // Add extra safety check for array
  if (!topics || !Array.isArray(topics)) {
    console.error('Topics is not an array:', topics);
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-light">Error loading topics. Please try again.</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-light">No topics available yet. Please go back and select an interest.</p>
      </div>
    );
  }

  // Display topics - show recommended first, then others
  const displayTopics = showAll ? filteredTopics : filteredTopics.slice(0, 9);
  const hasMore = filteredTopics.length > 9;

  // Generate a helpful description if missing
  const getTopicDescription = (topic: Topic) => {
    if (topic.description) return topic.description;
    // Generate a simple description based on title
    return `Learn ${topic.title.toLowerCase()} through hands-on projects and practical exercises. Build real-world skills you can apply immediately.`;
  };

  // Personalized recommendation message
  const getRecommendationMessage = () => {
    if (profile?.role) {
      return `Perfect for ${profile.role}s`;
    }
    if (profile?.goals_short_term) {
      return `Aligned with your goals`;
    }
    return "Recommended for you";
  };

  return (
    <div className="space-y-6">
      {/* Search bar - Larger and more prominent */}
      {topics.length > 6 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all font-light text-base"
          />
        </div>
      )}

      {/* Recommended section - More prominent */}
      {recommendedTopics.length > 0 && !searchQuery && !showAll && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gradient">{getRecommendationMessage()}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-brand-purple/30 via-brand-pink/20 to-transparent"></div>
            <span className="text-xs font-light text-gray-500">{recommendedTopics.length} matches</span>
          </div>
        </div>
      )}

      {/* Topics grid - Better spacing and larger */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayTopics.map((topic, index) => {
          const isSelected = selectedTopic?.id === topic.id;
          const isRecommended = recommendedTopics.some(t => t.id === topic.id) && !searchQuery && !showAll;
          const isExpanded = expandedTopic === topic.id;
          const description = getTopicDescription(topic);

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              whileHover={{ scale: 1.01, y: -1 }}
              className={`group relative rounded-xl border-2 transition-all duration-200 bg-white ${
                isSelected
                  ? 'border-brand-purple shadow-md'
                  : isRecommended
                  ? 'border-brand-purple/30 shadow-sm'
                  : 'border-gray-200 hover:border-brand-purple/50 hover:shadow-sm'
              }`}
            >
              {/* Brand gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 brand-gradient ${isSelected || isRecommended ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />

              {/* Card header with badge and title - Proper spacing */}
              <div className="px-5 pt-5 pb-3">
                {/* Badge and title row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <button
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                    className="flex-1 text-left"
                  >
                    <h3 className={`text-base font-medium transition-colors ${
                      isSelected
                        ? 'text-gradient'
                        : 'text-gray-900 group-hover:text-gradient'
                    }`}>
                      {topic.title}
                    </h3>
                  </button>
                  
                  {/* Badge positioned to the right, doesn't overlap */}
                  {isRecommended && !isSelected && (
                    <div className="flex-shrink-0 px-2 py-1 bg-brand-purple/10 rounded-md">
                      <span className="text-xs font-medium text-brand-purple whitespace-nowrap">Best Match</span>
                    </div>
                  )}
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-5 h-5 brand-gradient rounded-full flex items-center justify-center shadow-sm"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                
                {/* Description preview - Larger */}
                <button
                  onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                  className="w-full text-left"
                >
                  <p className="text-sm font-light text-gray-600 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-100"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-gray-500">Time:</span>
                        <span className="font-light text-gray-600">{topic.timeCommitment}</span>
                      </div>
                      {topic.difficulty && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-gray-500">Level:</span>
                          <span className="font-light text-gray-600 capitalize">{topic.difficulty}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action buttons - Larger and better spacing */}
              {onStartLearning && (
                <div className="px-5 pb-5 pt-2 flex gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Start Learning clicked for topic:', topic.title);
                      onStartLearning(topic);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white brand-gradient rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Start Learning
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Explore clicked for topic:', topic.title);
                      onSelect(topic);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-light text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                  >
                    Explore →
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Show more button */}
      {hasMore && !showAll && (
        <div className="text-center pt-2">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm font-medium text-brand-purple hover:text-brand-pink transition-colors"
          >
            Show all {filteredTopics.length} topics →
          </button>
        </div>
      )}

      {/* Show less button */}
      {showAll && (
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setShowAll(false);
              setSearchQuery('');
            }}
            className="text-sm font-medium text-brand-purple hover:text-brand-pink transition-colors"
          >
            Show less ↑
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicExploration;