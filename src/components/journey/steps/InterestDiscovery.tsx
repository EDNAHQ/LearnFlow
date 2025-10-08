import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JourneyLoadingAnimation from '../JourneyLoadingAnimation';

interface InterestCategory {
  id: string;
  title: string;
  description: string;
  examples: string[];
}

interface InterestDiscoveryProps {
  onSelect: (interest: { category: string; freeText?: string }) => void;
  selectedInterest: { category: string; freeText?: string } | null;
  isLoading?: boolean;
}

const interestCategories: InterestCategory[] = [
  {
    id: 'create',
    title: 'Creating & Building',
    description: 'I love making things from scratch',
    examples: ['Design', 'Art', 'Writing', 'Music Production']
  },
  {
    id: 'solve',
    title: 'Problem Solving',
    description: 'I enjoy finding solutions to challenges',
    examples: ['Mathematics', 'Engineering', 'Puzzles', 'Strategy']
  },
  {
    id: 'tech',
    title: 'Technology & Code',
    description: 'I want to understand how technology works',
    examples: ['Programming', 'AI/ML', 'Web Development', 'Cybersecurity']
  },
  {
    id: 'business',
    title: 'Business & Leadership',
    description: 'I aspire to build and lead organizations',
    examples: ['Entrepreneurship', 'Management', 'Marketing', 'Finance']
  },
  {
    id: 'help',
    title: 'Helping Others',
    description: 'I want to make a positive impact on people',
    examples: ['Healthcare', 'Education', 'Social Work', 'Counseling']
  },
  {
    id: 'analyze',
    title: 'Data & Analysis',
    description: 'I love discovering patterns and insights',
    examples: ['Data Science', 'Research', 'Analytics', 'Statistics']
  },
  {
    id: 'innovate',
    title: 'Innovation & Future',
    description: 'I want to work on cutting-edge technologies',
    examples: ['AI', 'Robotics', 'Blockchain', 'Space Tech']
  },
  {
    id: 'communicate',
    title: 'Communication & Media',
    description: 'I enjoy sharing ideas and stories',
    examples: ['Journalism', 'Public Speaking', 'Social Media', 'Podcasting']
  }
];

const InterestDiscovery: React.FC<InterestDiscoveryProps> = ({ onSelect, selectedInterest, isLoading }) => {
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeTextValue, setFreeTextValue] = useState('');

  const handleCategorySelect = (category: InterestCategory) => {
    onSelect({ category: category.id });
    setShowFreeText(false);
  };

  const handleFreeTextSubmit = () => {
    if (freeTextValue.trim()) {
      onSelect({ category: 'custom', freeText: freeTextValue });
    }
  };

  if (isLoading) {
    return (
      <JourneyLoadingAnimation
        message="Discovering topics for you"
        subMessage="Generating personalized learning topics..."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Grid - Clean, minimal design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interestCategories.map((category, index) => {
          const isSelected = selectedInterest?.category === category.id;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleCategorySelect(category)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50/30'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                {category.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {category.examples.map((example) => (
                  <span
                    key={example}
                    className={`text-xs px-3 py-1 rounded-full ${
                      isSelected
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {example}
                  </span>
                ))}
              </div>

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

      {/* Custom Interest Option */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => setShowFreeText(!showFreeText)}
          className="text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium"
        >
          I have something specific in mind...
        </button>

        {showFreeText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-3"
          >
            <textarea
              value={freeTextValue}
              onChange={(e) => setFreeTextValue(e.target.value)}
              placeholder="Tell us what you're interested in learning about..."
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
              rows={3}
            />
            <button
              onClick={handleFreeTextSubmit}
              disabled={!freeTextValue.trim()}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                freeTextValue.trim()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Use This Interest
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterestDiscovery;