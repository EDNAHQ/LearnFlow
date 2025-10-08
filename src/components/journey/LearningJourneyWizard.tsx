import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InterestDiscovery from './steps/InterestDiscovery';
import TopicExploration from './steps/TopicExploration';
import { useLearningJourney } from '../../hooks/journey/useLearningJourney';

interface LearningJourneyWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const LearningJourneyWizard: React.FC<LearningJourneyWizardProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [topicHistory, setTopicHistory] = useState<string[]>([]);

  const {
    journeyData,
    updateJourneyData,
    generateTopics,
    generateSubTopics,
    isLoading,
    error
  } = useLearningJourney();

  const handleTopicSelect = async (topic: any) => {
    // Add selected topic to history
    setTopicHistory([...topicHistory, topic.title]);

    // Generate subtopics for this topic
    updateJourneyData({ selectedTopic: topic });
    await generateSubTopics(topic);
  };

  const handleBack = () => {
    if (topicHistory.length > 0) {
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
    updateJourneyData({ selectedInterest: interest });
    await generateTopics(interest);
    setCurrentStep(2);
  };

  const handleStartLearning = (topic: any) => {
    // Save topic to session storage and navigate to plan page
    sessionStorage.setItem('learn-topic', topic.title);
    navigate(`/plan?topic=${encodeURIComponent(topic.title)}`);
    onClose();
  };

  const getStepTitle = () => {
    if (currentStep === 1) {
      return "What do you want to learn?";
    }
    if (topicHistory.length === 0) {
      return "Pick a topic";
    }
    return topicHistory[topicHistory.length - 1];
  };

  const getStepDescription = () => {
    if (currentStep === 1) {
      return "Choose an area of interest to explore";
    }
    if (topicHistory.length === 0) {
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
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
          >
            Close
          </button>

          {/* Breadcrumb trail */}
          {topicHistory.length > 0 && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <button
                onClick={() => {
                  setTopicHistory([]);
                  setCurrentStep(1);
                }}
                className="hover:text-purple-600"
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
                    className="hover:text-purple-600"
                  >
                    {topic}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getStepTitle()}
          </h2>
          <p className="text-gray-600 text-base">
            {getStepDescription()}
          </p>
        </div>

        {/* Content - Scrollable area */}
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
        <div className="px-8 py-6 border-t border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
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
        </div>
      </motion.div>
    </div>
  );
};

export default LearningJourneyWizard;