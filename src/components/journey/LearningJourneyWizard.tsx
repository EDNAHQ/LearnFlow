import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InterestDiscovery from './steps/InterestDiscovery';
import TopicExploration from './steps/TopicExploration';
import SkillBreakdown from './steps/SkillBreakdown';
import LearningPlan from './steps/LearningPlan';
import JourneyLoadingAnimation from './JourneyLoadingAnimation';
import { useLearningJourney } from '../../hooks/journey/useLearningJourney';

interface LearningJourneyWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const LearningJourneyWizard: React.FC<LearningJourneyWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSteps = 4;

  const {
    journeyData,
    updateJourneyData,
    generateTopics,
    generateSkills,
    generateLearningPlan,
    isLoading,
    error
  } = useLearningJourney();

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setIsTransitioning(true);

      // Show loading animation briefly before transitioning
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);

      // Trigger AI generation based on current step
      if (currentStep === 1 && journeyData.selectedInterest) {
        await generateTopics(journeyData.selectedInterest);
      } else if (currentStep === 2 && journeyData.selectedTopic) {
        await generateSkills(journeyData.selectedTopic);
      } else if (currentStep === 3 && journeyData.selectedSkills) {
        await generateLearningPlan();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "What sparks your curiosity?";
      case 2:
        return "Let's explore your interests";
      case 3:
        return "Building your skill roadmap";
      case 4:
        return "Your personalized learning journey";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Tell us what excites you most and we'll help you discover amazing learning opportunities";
      case 2:
        return "Based on your interests, here are some fascinating topics you could dive into";
      case 3:
        return "Let's break down the skills you'll develop and see your learning path";
      case 4:
        return "Here's your custom curriculum to get started on your learning adventure";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InterestDiscovery
            onSelect={(interest) => updateJourneyData({ selectedInterest: interest })}
            selectedInterest={journeyData.selectedInterest}
          />
        );
      case 2:
        return (
          <TopicExploration
            topics={journeyData.topics}
            onSelect={(topic) => updateJourneyData({ selectedTopic: topic })}
            selectedTopic={journeyData.selectedTopic}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <SkillBreakdown
            skills={journeyData.skills}
            topic={journeyData.selectedTopic}
            onSelectSkills={(skills) => updateJourneyData({ selectedSkills: skills })}
            selectedSkills={journeyData.selectedSkills}
            isLoading={isLoading}
          />
        );
      case 4:
        return (
          <LearningPlan
            plan={journeyData.learningPlan}
            isLoading={isLoading}
            onStartLearning={() => {
              // Handle starting the learning journey
              onClose();
            }}
          />
        );
      default:
        return null;
    }
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

          {/* Progress Indicators */}
          <div className="flex items-center gap-3 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step === currentStep
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                      : step < currentStep
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-20 h-1 ml-3 rounded-full transition-all ${
                      step < currentStep ? 'bg-purple-200' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

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
            disabled={currentStep === 1}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !journeyData.selectedInterest) ||
              (currentStep === 2 && !journeyData.selectedTopic) ||
              (currentStep === 3 && (!journeyData.selectedSkills || journeyData.selectedSkills.length === 0)) ||
              isLoading
            }
            className={`px-8 py-2.5 rounded-lg font-medium transition-all ${
              isLoading ||
              (currentStep === 1 && !journeyData.selectedInterest) ||
              (currentStep === 2 && !journeyData.selectedTopic) ||
              (currentStep === 3 && (!journeyData.selectedSkills || journeyData.selectedSkills.length === 0))
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <span>{currentStep === totalSteps ? 'Get Started' : 'Continue'}</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningJourneyWizard;