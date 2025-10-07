import React from 'react';
import { motion } from 'framer-motion';
import JourneyLoadingAnimation from '../JourneyLoadingAnimation';

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
  selectedTopic: Topic | null;
  isLoading: boolean;
}

const TopicExploration: React.FC<TopicExplorationProps> = ({
  topics,
  onSelect,
  selectedTopic,
  isLoading
}) => {
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Beginner Friendly';
      case 'intermediate':
        return 'Some Experience Needed';
      case 'advanced':
        return 'Advanced Level';
      default:
        return difficulty;
    }
  };

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
        <p className="text-gray-600">Error loading topics. Please try again.</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No topics available yet. Please go back and select an interest.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clean header */}
      <div className="mb-6">
        <p className="text-gray-600 text-sm">
          We've analyzed your interests and found {topics.length} topics that align with your goals
        </p>
      </div>

      {/* Topics Grid - Clean minimal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic, index) => {
          const isSelected = selectedTopic?.id === topic.id;

          return (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelect(topic)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50/30'
              }`}
            >
              {/* Match Score and Trending */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
                  {topic.title}
                </h3>
                <div className="text-right">
                  {topic.trending && (
                    <span className="text-xs text-orange-500 font-medium block mb-1">
                      🔥 Trending
                    </span>
                  )}
                  <span className="text-xs font-medium text-purple-600">
                    {topic.matchScore}% match
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {topic.description}
              </p>

              {/* Metadata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Level</span>
                  <span className="text-gray-700 font-medium">{getDifficultyLabel(topic.difficulty)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Time</span>
                  <span className="text-gray-700 font-medium">{topic.timeCommitment}</span>
                </div>
              </div>

              {/* Career Paths */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Career paths</p>
                <div className="flex flex-wrap gap-2">
                  {topic.careerPaths.slice(0, 3).map((path) => (
                    <span
                      key={path}
                      className={`text-xs px-3 py-1 rounded-full ${
                        isSelected
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {path}
                    </span>
                  ))}
                  {topic.careerPaths.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{topic.careerPaths.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <p className="text-sm text-purple-900 font-medium mb-1">💡 Pro Tip</p>
        <p className="text-xs text-purple-700">
          Choose a topic that excites you most. You can always explore others later.
        </p>
      </div>
    </div>
  );
};

export default TopicExploration;