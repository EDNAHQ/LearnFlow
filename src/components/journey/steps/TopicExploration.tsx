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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {topics.map((topic, index) => {
          const isSelected = selectedTopic?.id === topic.id;
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.015 }}
              className={`group relative rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-transparent bg-gradient-to-br from-[#6654f5]/10 via-[#ca5a8b]/10 to-[#f2b347]/10 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-transparent hover:bg-gradient-to-br hover:from-[#6654f5]/5 hover:via-[#ca5a8b]/5 hover:to-[#f2b347]/5 hover:shadow-md'
              }`}
            >
              {/* Gradient border on hover */}
              {!isSelected && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-[#6654f5]/20 via-[#ca5a8b]/20 to-[#f2b347]/20 -z-10 blur-sm" />
              )}

              {/* Main clickable area - explore deeper */}
              <button
                onClick={() => onSelect(topic)}
                className="w-full text-left px-5 py-4 pb-3"
              >
                <span className={`font-medium transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent'
                    : 'text-gray-900 group-hover:bg-gradient-to-r group-hover:from-[#6654f5] group-hover:via-[#ca5a8b] group-hover:to-[#f2b347] group-hover:bg-clip-text group-hover:text-transparent'
                }`}>
                  {topic.title}
                </span>
              </button>

              {/* Action buttons */}
              {onStartLearning && (
                <div className="px-5 pb-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartLearning(topic);
                    }}
                    className="flex-1 px-2 py-1 text-[11px] font-medium text-white brand-gradient rounded-md hover:opacity-90 transition-opacity"
                  >
                    Start Learning
                  </button>
                  <button
                    onClick={() => onSelect(topic)}
                    className="flex-1 px-2 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Explore →
                  </button>
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 brand-gradient rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicExploration;