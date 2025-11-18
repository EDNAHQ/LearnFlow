import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InterestDiscovery from './steps/InterestDiscovery';
import TopicExploration from './steps/TopicExploration';
import ContentPreferences, { ContentPreferencesData } from './steps/ContentPreferences';
import { useLearningJourney } from '../../hooks/journey/useLearningJourney';
import { useBehaviorTracking } from '@/hooks/analytics';
import { useUserProfile } from '../../hooks/profile/useUserProfile';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { useAuth } from '@/hooks/auth';

interface LearningJourneyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

const LearningJourneyWizard: React.FC<LearningJourneyWizardProps> = ({ isOpen, onClose, initialTopic }) => {
  const navigate = useNavigate();
  const { trackClick } = useBehaviorTracking();
  const [currentStep, setCurrentStep] = useState(initialTopic ? 2 : 1);
  const [topicHistory, setTopicHistory] = useState<string[]>([]);
  const [contentPreferences, setContentPreferences] = useState<ContentPreferencesData>({});
  const [selectedTopicForLearning, setSelectedTopicForLearning] = useState<any>(null);
  const { profile } = useUserProfile();
  const { profile: learningProfile } = useUserLearningProfile();
  const { user } = useAuth();

  // Auto-detect preferences from learning profile
  const autoDetectedPreferences = useMemo(() => {
    if (!learningProfile) return null;

    const detected: ContentPreferencesData = {};

    if (learningProfile.learningVelocity === 'fast') {
      detected.content_style = 'practical';
    } else if (learningProfile.learningVelocity === 'deliberate') {
      detected.content_style = 'technical';
    } else {
      detected.content_style = 'conversational';
    }

    if (learningProfile.optimalSessionLength >= 45) {
      detected.content_length = 'comprehensive';
    } else if (learningProfile.optimalSessionLength >= 30) {
      detected.content_length = 'detailed';
    } else if (learningProfile.optimalSessionLength >= 20) {
      detected.content_length = 'standard';
    } else {
      detected.content_length = 'brief';
    }

    if (learningProfile.preferredDifficulty >= 4 && learningProfile.avgSuccessRate >= 80) {
      detected.content_complexity = 'expert';
    } else if (learningProfile.preferredDifficulty >= 3 && learningProfile.avgSuccessRate >= 75) {
      detected.content_complexity = 'advanced';
    } else if (learningProfile.preferredDifficulty >= 2) {
      detected.content_complexity = 'balanced';
    } else {
      detected.content_complexity = 'simplified';
    }

    if (learningProfile.prefersVisual) {
      detected.preferred_examples = 'real-world';
      detected.learning_approach = 'visual';
    } else if (learningProfile.prefersAudio) {
      detected.learning_approach = 'conceptual';
      detected.preferred_examples = 'mixed';
    } else if (learningProfile.skipRate < 0.1 && learningProfile.hintUsageRate < 0.2) {
      detected.learning_approach = 'hands-on';
      detected.preferred_examples = 'code-focused';
    } else if (learningProfile.remediationFrequency > 0.3) {
      detected.learning_approach = 'analytical';
      detected.preferred_examples = 'theoretical';
    } else {
      detected.learning_approach = 'balanced';
      detected.preferred_examples = 'real-world';
    }

    return detected;
  }, [learningProfile]);

  const hasEnoughData = learningProfile && 
                        learningProfile.totalLearningTimeMinutes >= 30 && 
                        learningProfile.avgSuccessRate > 0;

  const {
    journeyData,
    updateJourneyData,
    generateTopics,
    generateSubTopics,
    isLoading,
    error
  } = useLearningJourney();

  // Handle initial topic when wizard opens
  useEffect(() => {
    if (isOpen && initialTopic && currentStep === 2 && journeyData.topics.length === 0) {
      // Create a topic object from the initial topic
      const topicObject = {
        id: `topic-initial-${Date.now()}`,
        title: initialTopic,
        description: `Learn ${initialTopic} through hands-on projects and practical exercises.`,
        difficulty: 'beginner' as const,
        timeCommitment: '10-20 hours',
        careerPaths: [],
        trending: false,
        matchScore: 95,
      };
      
      // Set topics with the initial topic
      updateJourneyData({ 
        topics: [topicObject],
        selectedTopic: topicObject 
      });
      
      // Auto-select and move to preferences step
      setSelectedTopicForLearning(topicObject);
      // Auto-advance to preferences step after a brief delay
      setTimeout(() => {
        setCurrentStep(3);
      }, 300);
    }
  }, [isOpen, initialTopic, currentStep, journeyData.topics.length, updateJourneyData]);

  const handleTopicSelect = async (topic: any) => {
    // Add selected topic to history
    setTopicHistory([...topicHistory, topic.title]);

    // Generate subtopics for this topic
    updateJourneyData({ selectedTopic: topic });
    await generateSubTopics(topic);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      // Back from preferences to topic selection
      setCurrentStep(2);
      setSelectedTopicForLearning(null);
    } else if (topicHistory.length > 0) {
      // Go back one level in topic hierarchy
      const newHistory = [...topicHistory];
      newHistory.pop();
      setTopicHistory(newHistory);

      if (newHistory.length === 0) {
        // Back to initial topics
        setCurrentStep(1);
      }
    } else if (currentStep === 2) {
      // Back to interest selection
      setCurrentStep(1);
      updateJourneyData({ topics: [], selectedTopic: null });
    }
  };

  const handleInterestSelect = async (interest: any) => {
    // Track interest selection
    trackClick(`interest-${interest.category || interest.id}`, 'content');
    
    updateJourneyData({ selectedInterest: interest });
    await generateTopics(interest);
    setCurrentStep(2);
  };

  const handleStartLearning = (topic: any) => {
    // Track topic selection - critical data point!
    trackClick(`topic-${topic.title}`, 'content');
    
    // Store topic
    setSelectedTopicForLearning(topic);
    
    // Always show preferences step, but pre-populate with defaults
    // Priority: 1. Profile defaults, 2. Auto-detected from learning profile, 3. Empty
    const defaultPreferences: ContentPreferencesData = {};
    
    if (profile?.default_content_style) defaultPreferences.content_style = profile.default_content_style as any;
    if (profile?.default_content_length) defaultPreferences.content_length = profile.default_content_length as any;
    if (profile?.default_content_complexity) defaultPreferences.content_complexity = profile.default_content_complexity as any;
    if (profile?.default_preferred_examples) defaultPreferences.preferred_examples = profile.default_preferred_examples as any;
    if (profile?.default_learning_approach) defaultPreferences.learning_approach = profile.default_learning_approach as any;
    
    // If no profile defaults, use auto-detected preferences
    if (Object.keys(defaultPreferences).length === 0 && autoDetectedPreferences) {
      Object.assign(defaultPreferences, autoDetectedPreferences);
    }
    
    setContentPreferences(defaultPreferences);
    setCurrentStep(3);
  };

  const handlePreferencesContinue = () => {
    if (!selectedTopicForLearning) return;
    
    // Save preferences to session storage
    sessionStorage.setItem('content-preferences', JSON.stringify(contentPreferences));
    
    // Save topic to session storage and navigate to plan page
    sessionStorage.setItem('learn-topic', selectedTopicForLearning.title);
    navigate(`/plan?topic=${encodeURIComponent(selectedTopicForLearning.title)}`);
    onClose();
  };

  const handlePreferencesSkip = () => {
    if (!selectedTopicForLearning) return;
    
    // If user has profile defaults, use those; otherwise use empty preferences
    const preferencesToUse = profile && (
      profile.default_content_style || 
      profile.default_content_length || 
      profile.default_content_complexity ||
      profile.default_preferred_examples ||
      profile.default_learning_approach
    ) ? {
      content_style: profile.default_content_style as any,
      content_length: profile.default_content_length as any,
      content_complexity: profile.default_content_complexity as any,
      preferred_examples: profile.default_preferred_examples as any,
      learning_approach: profile.default_learning_approach as any,
    } : {};
    
    // Save preferences to session storage
    sessionStorage.setItem('content-preferences', JSON.stringify(preferencesToUse));
    
    // Save topic to session storage and navigate to plan page
    sessionStorage.setItem('learn-topic', selectedTopicForLearning.title);
    navigate(`/plan?topic=${encodeURIComponent(selectedTopicForLearning.title)}`);
    onClose();
  };

  const getStepTitle = () => {
    if (currentStep === 1) {
      return "What do you want to learn?";
    }
    if (currentStep === 3) {
      return selectedTopicForLearning 
        ? `Customize Content for "${selectedTopicForLearning.title}"`
        : "Customize Your Learning";
    }
    if (topicHistory.length === 0) {
      return "Pick a topic";
    }
    return topicHistory[topicHistory.length - 1];
  };

  const getStepDescription = () => {
    if (currentStep === 1) {
      // Personalized greeting based on profile
      if (profile?.role) {
        return `Hi ${profile.role}! Let's find the perfect learning path for you.`;
      }
      return "Choose an area of interest to explore";
    }
    if (currentStep === 3) {
      const hasDefaults = profile && (
        profile.default_content_style || 
        profile.default_content_length || 
        profile.default_content_complexity ||
        profile.default_preferred_examples ||
        profile.default_learning_approach
      );
      
      if (hasDefaults) {
        return `Your default preferences are pre-selected. You can adjust them for this project or continue with defaults.`;
      }
      
      return selectedTopicForLearning 
        ? `We'll personalize your learning path for "${selectedTopicForLearning.title}" based on your preferences.`
        : "Choose how you'd like your content to be generated.";
    }
    if (topicHistory.length === 0) {
      // Personalized message based on user's goals
      if (profile?.goals_short_term) {
        return `We found ${journeyData.topics.length} topics tailored to help you "${profile.goals_short_term}"`;
      }
      return `${journeyData.topics.length} topics to explore`;
    }
    return `${journeyData.topics.length} subtopics to dive deeper`;
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <InterestDiscovery
          onSelect={handleInterestSelect}
          selectedInterest={journeyData.selectedInterest}
          isLoading={isLoading}
        />
      );
    }

    if (currentStep === 3) {
      const hasProfileDefaults = profile && (
        profile.default_content_style || 
        profile.default_content_length || 
        profile.default_content_complexity ||
        profile.default_preferred_examples ||
        profile.default_learning_approach
      );
      
      const profileDefaultsData: ContentPreferencesData | undefined = hasProfileDefaults ? {
        content_style: profile.default_content_style as any,
        content_length: profile.default_content_length as any,
        content_complexity: profile.default_content_complexity as any,
        preferred_examples: profile.default_preferred_examples as any,
        learning_approach: profile.default_learning_approach as any,
      } : undefined;
      
      return (
        <ContentPreferences
          preferences={contentPreferences}
          onPreferencesChange={setContentPreferences}
          onContinue={handlePreferencesContinue}
          onSkip={handlePreferencesSkip}
          hasProfileDefaults={hasProfileDefaults || false}
          profileDefaults={profileDefaultsData}
        />
      );
    }

    return (
      <TopicExploration
        topics={journeyData.topics}
        onSelect={handleTopicSelect}
        onStartLearning={handleStartLearning}
        selectedTopic={journeyData.selectedTopic}
        isLoading={isLoading}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header - More spacious and immersive */}
        <div className="relative px-8 pt-8 pb-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-b from-white to-gray-50/50">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
          >
            Close
          </button>

          {/* Breadcrumb trail */}
          {topicHistory.length > 0 && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 font-light">
              <button
                onClick={() => {
                  setTopicHistory([]);
                  setCurrentStep(1);
                }}
                className="hover:text-brand-purple transition-colors"
              >
                Start
              </button>
              {topicHistory.map((topic, idx) => (
                <React.Fragment key={idx}>
                  <span>/</span>
                  <button
                    onClick={() => {
                      const newHistory = topicHistory.slice(0, idx + 1);
                      setTopicHistory(newHistory);
                    }}
                    className="hover:text-brand-purple transition-colors"
                  >
                    {topic}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-medium text-gradient mb-2">
            {getStepTitle()}
          </h2>
          <p className="text-gray-600 text-base font-light leading-relaxed">
            {getStepDescription()}
          </p>
        </div>

        {/* Content - More spacious with better padding */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="px-8 py-5 border-t border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 && topicHistory.length === 0}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              currentStep === 1 && topicHistory.length === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Back
          </button>
          {currentStep === 3 && (
            <div className="flex items-center gap-2">
              {profile && (
                profile.default_content_style || 
                profile.default_content_length || 
                profile.default_content_complexity ||
                profile.default_preferred_examples ||
                profile.default_learning_approach
              ) && (
                <p className="text-xs font-medium text-brand-purple">
                  Using your profile defaults
                </p>
              )}
              <p className="text-xs font-light text-gray-500">
                Optional: Skip to use default settings
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LearningJourneyWizard;