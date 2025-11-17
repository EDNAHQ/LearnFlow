import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import JourneyLoadingAnimation from '../JourneyLoadingAnimation';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { useProjects } from '@/hooks/projects/useProjects';
import { Sparkles } from 'lucide-react';

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
    id: 'analyze',
    title: 'Data & Analytics',
    description: 'I love discovering patterns and insights',
    examples: ['Data Science', 'Analytics', 'Statistics', 'Business Intelligence']
  },
  {
    id: 'app-dev',
    title: 'Application Development',
    description: 'I want to build software applications',
    examples: ['Web Apps', 'Mobile Apps', 'Desktop Software', 'APIs']
  },
  {
    id: 'dev',
    title: 'Software Development',
    description: 'I want to master programming and development',
    examples: ['Programming Languages', 'Software Engineering', 'DevOps', 'Testing']
  },
  {
    id: 'automation',
    title: 'Automation & Workflows',
    description: 'I want to automate processes and workflows',
    examples: ['Process Automation', 'RPA', 'Workflow Design', 'Task Automation']
  },
  {
    id: 'data-eng',
    title: 'Data Engineering',
    description: 'I want to build data pipelines and infrastructure',
    examples: ['ETL', 'Data Pipelines', 'Database Design', 'Data Architecture']
  },
  {
    id: 'integration',
    title: 'Application Integration',
    description: 'I want to connect systems and integrate applications',
    examples: ['API Integration', 'System Integration', 'Middleware', 'Cloud Services']
  }
];

const InterestDiscovery: React.FC<InterestDiscoveryProps> = ({ onSelect, selectedInterest, isLoading }) => {
  const [freeTextValue, setFreeTextValue] = useState('');
  const { profile: userProfile } = useUserProfile();
  const { profile: learningProfile } = useUserLearningProfile();
  const { projects } = useProjects();

  const personalizedData = useMemo(() => {
    const projectTopics = projects.map(p => p.topic.toLowerCase());
    const completedProjects = projects.filter(p => p.is_completed);
    const mostEngagedTopics = learningProfile?.mostEngagedTopics || [];
    
    const categoryScores: { [key: string]: number } = {};
    
    interestCategories.forEach(category => {
      let score = 0;
      
      category.examples.forEach(example => {
        const exampleLower = example.toLowerCase();
        if (projectTopics.some(topic => topic.includes(exampleLower) || exampleLower.includes(topic))) {
          score += 2;
        }
        if (mostEngagedTopics.some(topic => topic.toLowerCase().includes(exampleLower))) {
          score += 3;
        }
      });
      
      if (userProfile?.role) {
        const roleLower = userProfile.role.toLowerCase();
        if (category.id === 'analyze' && (roleLower.includes('analyst') || roleLower.includes('data'))) score += 5;
        if (category.id === 'app-dev' && (roleLower.includes('developer') || roleLower.includes('engineer'))) score += 5;
        if (category.id === 'dev' && (roleLower.includes('developer') || roleLower.includes('engineer'))) score += 5;
        if (category.id === 'automation' && roleLower.includes('automation')) score += 5;
        if (category.id === 'data-eng' && (roleLower.includes('data') || roleLower.includes('engineer'))) score += 5;
        if (category.id === 'integration' && roleLower.includes('integration')) score += 5;
      }
      
      if (userProfile?.industry) {
        const industryLower = userProfile.industry.toLowerCase();
        if (category.id === 'analyze' && (industryLower.includes('finance') || industryLower.includes('consulting'))) score += 3;
        if (category.id === 'app-dev' && industryLower.includes('tech')) score += 3;
      }
      
      if (userProfile?.skill_data && category.id === 'analyze') score += userProfile.skill_data;
      if (userProfile?.skill_apps && category.id === 'app-dev') score += userProfile.skill_apps;
      if (userProfile?.skill_automation && category.id === 'automation') score += userProfile.skill_automation;
      if (userProfile?.skill_data && category.id === 'data-eng') score += userProfile.skill_data;
      
      if (userProfile?.goals_short_term) {
        const goalLower = userProfile.goals_short_term.toLowerCase();
        if (category.examples.some(ex => goalLower.includes(ex.toLowerCase()))) score += 4;
      }
      
      categoryScores[category.id] = score;
    });
    
    const sortedCategories = [...interestCategories].sort((a, b) => {
      return categoryScores[b.id] - categoryScores[a.id];
    });
    
    const recommendedCategories = sortedCategories.filter(cat => categoryScores[cat.id] > 0).slice(0, 3);
    
    let suggestedPlaceholder = "Type anything you want to learn...";
    if (userProfile?.goals_short_term) {
      suggestedPlaceholder = `e.g., ${userProfile.goals_short_term.substring(0, 50)}...`;
    } else if (mostEngagedTopics.length > 0) {
      suggestedPlaceholder = `e.g., ${mostEngagedTopics[0]}...`;
    } else if (completedProjects.length > 0) {
      const lastProject = completedProjects[completedProjects.length - 1];
      suggestedPlaceholder = `e.g., advanced ${lastProject.topic}...`;
    }
    
    return {
      sortedCategories,
      recommendedCategories,
      categoryScores,
      suggestedPlaceholder,
      hasPersonalization: recommendedCategories.length > 0 || userProfile || mostEngagedTopics.length > 0,
    };
  }, [projects, userProfile, learningProfile]);

  const handleCategorySelect = (category: InterestCategory) => {
    onSelect({ category: category.id });
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
    <div className="space-y-4">
      {/* Free Text Input - Brand compliant */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gradient">
            Tell us what you want to learn:
          </label>
          {personalizedData.hasPersonalization && (
            <span className="text-xs font-light text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-purple" />
              Personalized for you
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <textarea
            value={freeTextValue}
            onChange={(e) => setFreeTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleFreeTextSubmit();
              }
            }}
            placeholder={personalizedData.suggestedPlaceholder}
            className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
            rows={2}
          />
          <motion.button
            onClick={handleFreeTextSubmit}
            disabled={!freeTextValue.trim()}
            whileHover={{ scale: freeTextValue.trim() ? 1.02 : 1 }}
            whileTap={{ scale: freeTextValue.trim() ? 0.98 : 1 }}
            className={`self-start px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              freeTextValue.trim()
                ? 'brand-gradient text-white hover:opacity-90 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Go →
          </motion.button>
        </div>
      </div>

      {/* Divider - Brand compliant */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-500 font-light">Or choose a category</span>
        </div>
      </div>

      {/* Recommended Categories Section */}
      {personalizedData.recommendedCategories.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span className="text-sm font-medium text-gray-700">Recommended for you</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {personalizedData.recommendedCategories.map((category, index) => {
              const isSelected = selectedInterest?.category === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleCategorySelect(category)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden group ${
                    isSelected
                      ? 'border-brand-purple bg-white shadow-lg'
                      : 'border-brand-purple/30 bg-gradient-to-br from-brand-purple/5 to-white hover:border-brand-purple/60 hover:shadow-md'
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 brand-gradient opacity-100" />
                  
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-base font-medium ${isSelected ? 'text-gradient' : 'text-gray-900'} transition-colors`}>
                        {category.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple font-medium">
                        For you
                      </span>
                    </div>
                    <p className="text-xs font-light text-gray-600 leading-tight mb-3">
                      {category.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {category.examples.slice(0, 3).map((example) => (
                      <span
                        key={example}
                        className={`text-xs px-2 py-0.5 rounded-md font-light ${
                          isSelected
                            ? 'brand-gradient text-white'
                            : 'bg-brand-purple/10 text-brand-purple'
                        } transition-all`}
                      >
                        {example}
                      </span>
                    ))}
                    {category.examples.length > 3 && (
                      <span className={`text-xs px-2 py-0.5 rounded-md font-light ${
                        isSelected
                          ? 'brand-gradient text-white'
                          : 'bg-brand-purple/10 text-brand-purple'
                      } transition-all`}>
                        +{category.examples.length - 3}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 brand-gradient rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {personalizedData.sortedCategories.length > personalizedData.recommendedCategories.length && (
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-light">All categories</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Grid - Brand compliant, no icons, brand colors only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {personalizedData.sortedCategories.map((category, index) => {
          const isSelected = selectedInterest?.category === category.id;
          const isRecommended = personalizedData.recommendedCategories.some(c => c.id === category.id);
          const score = personalizedData.categoryScores[category.id];
          
          if (isRecommended) return null;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleCategorySelect(category)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden group ${
                isSelected
                  ? 'border-brand-purple bg-white shadow-lg'
                  : 'border-gray-200 bg-white hover:border-brand-purple/50 hover:shadow-md'
              }`}
            >
              {/* Brand gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 brand-gradient ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
              
              {/* Content - No icons */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-base font-medium ${isSelected ? 'text-gradient' : 'text-gray-900 group-hover:text-brand-purple'} transition-colors`}>
                    {category.title}
                  </h3>
                  {score > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-light">
                      {score} match{score !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs font-light text-gray-600 leading-tight mb-3">
                  {category.description}
                </p>
              </div>

              {/* Examples - Brand colored tags */}
              <div className="flex flex-wrap gap-1.5">
                {category.examples.slice(0, 3).map((example) => (
                  <span
                    key={example}
                    className={`text-xs px-2 py-0.5 rounded-md font-light ${
                      isSelected
                        ? 'brand-gradient text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-brand-purple/10 group-hover:text-brand-purple'
                    } transition-all`}
                  >
                    {example}
                  </span>
                ))}
                {category.examples.length > 3 && (
                  <span className={`text-xs px-2 py-0.5 rounded-md font-light ${
                    isSelected
                      ? 'brand-gradient text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-[#6654f5]/10 group-hover:text-[#6654f5]'
                  } transition-all`}>
                    +{category.examples.length - 3}
                  </span>
                )}
              </div>

              {/* Selected indicator - Brand gradient */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 brand-gradient rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default InterestDiscovery;