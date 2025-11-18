import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';

export interface ContentPreferencesData {
  content_style?: 'conversational' | 'formal' | 'technical' | 'storytelling' | 'practical' | null;
  content_length?: 'brief' | 'standard' | 'detailed' | 'comprehensive' | null;
  content_complexity?: 'simplified' | 'balanced' | 'advanced' | 'expert' | null;
  preferred_examples?: 'real-world' | 'theoretical' | 'code-focused' | 'business-focused' | 'mixed' | null;
  learning_approach?: 'hands-on' | 'conceptual' | 'visual' | 'analytical' | 'balanced' | null;
}

interface ContentPreferencesProps {
  preferences: ContentPreferencesData;
  onPreferencesChange: (preferences: ContentPreferencesData) => void;
  onContinue: () => void;
  onSkip: () => void;
  hasProfileDefaults?: boolean;
  profileDefaults?: ContentPreferencesData;
}

const ContentPreferences: React.FC<ContentPreferencesProps> = ({
  preferences,
  onPreferencesChange,
  onContinue,
  onSkip,
  hasProfileDefaults = false,
  profileDefaults
}) => {
  const { profile } = useUserLearningProfile();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-expand sections that have defaults selected
  useEffect(() => {
    if (hasProfileDefaults && profileDefaults) {
      // Expand sections that have defaults
      const sectionsToExpand: string[] = [];
      if (profileDefaults.content_style) sectionsToExpand.push('content_style');
      if (profileDefaults.content_length) sectionsToExpand.push('content_length');
      if (profileDefaults.content_complexity) sectionsToExpand.push('content_complexity');
      if (profileDefaults.preferred_examples) sectionsToExpand.push('preferred_examples');
      if (profileDefaults.learning_approach) sectionsToExpand.push('learning_approach');
      
      // Expand first section with a default if none are expanded
      if (sectionsToExpand.length > 0 && !expandedSection) {
        setExpandedSection(sectionsToExpand[0]);
      }
    }
  }, [hasProfileDefaults, profileDefaults, expandedSection]);

  // Auto-detect preferences from user learning profile
  const autoDetectPreferences = useMemo(() => {
    if (!profile) return null;

    const detected: ContentPreferencesData = {};

    // Content Style: Based on learning velocity and engagement patterns
    if (profile.learningVelocity === 'fast') {
      detected.content_style = 'practical';
    } else if (profile.learningVelocity === 'deliberate') {
      detected.content_style = 'technical';
    } else {
      detected.content_style = 'conversational';
    }

    // Content Length: Based on optimal session length
    if (profile.optimalSessionLength >= 45) {
      detected.content_length = 'comprehensive';
    } else if (profile.optimalSessionLength >= 30) {
      detected.content_length = 'detailed';
    } else if (profile.optimalSessionLength >= 20) {
      detected.content_length = 'standard';
    } else {
      detected.content_length = 'brief';
    }

    // Complexity: Based on preferred difficulty and success rate
    if (profile.preferredDifficulty >= 4 && profile.avgSuccessRate >= 80) {
      detected.content_complexity = 'expert';
    } else if (profile.preferredDifficulty >= 3 && profile.avgSuccessRate >= 75) {
      detected.content_complexity = 'advanced';
    } else if (profile.preferredDifficulty >= 2) {
      detected.content_complexity = 'balanced';
    } else {
      detected.content_complexity = 'simplified';
    }

    // Example Types: Based on learning approach and engagement
    if (profile.prefersVisual) {
      detected.preferred_examples = 'real-world';
    } else if (profile.hintUsageRate < 0.1 && profile.exampleUsageRate > 0.3) {
      detected.preferred_examples = 'code-focused';
    } else if (profile.remediationFrequency < 0.2) {
      detected.preferred_examples = 'mixed';
    } else {
      detected.preferred_examples = 'real-world';
    }

    // Learning Approach: Based on format preferences and engagement patterns
    if (profile.prefersVisual) {
      detected.learning_approach = 'visual';
    } else if (profile.prefersAudio) {
      detected.learning_approach = 'conceptual';
    } else if (profile.skipRate < 0.1 && profile.hintUsageRate < 0.2) {
      detected.learning_approach = 'hands-on';
    } else if (profile.remediationFrequency > 0.3) {
      detected.learning_approach = 'analytical';
    } else {
      detected.learning_approach = 'balanced';
    }

    return detected;
  }, [profile]);

  // Auto-apply detected preferences if user has enough data
  useEffect(() => {
    if (autoDetectPreferences && profile && profile.totalLearningTimeMinutes > 30) {
      const hasEnoughData = profile.totalLearningTimeMinutes >= 30 && 
                           profile.avgSuccessRate > 0;
      
      if (hasEnoughData && !autoDetected) {
        onPreferencesChange(autoDetectPreferences);
        setAutoDetected(true);
      }
    }
  }, [autoDetectPreferences, profile, autoDetected, onPreferencesChange]);

  const updatePreference = <K extends keyof ContentPreferencesData>(
    key: K,
    value: ContentPreferencesData[K]
  ) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const styleOptions = [
    { value: 'conversational', label: 'Conversational', description: 'Friendly, like talking to a friend' },
    { value: 'formal', label: 'Formal', description: 'Academic and professional tone' },
    { value: 'technical', label: 'Technical', description: 'Precise terminology and details' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrative-driven explanations' },
    { value: 'practical', label: 'Practical', description: 'Actionable, real-world focused' }
  ];

  const lengthOptions = [
    { value: 'brief', label: 'Brief', description: '300-400 words - Quick overviews' },
    { value: 'standard', label: 'Standard', description: '600-700 words - Balanced depth' },
    { value: 'detailed', label: 'Detailed', description: '800-1000 words - Comprehensive coverage' },
    { value: 'comprehensive', label: 'Comprehensive', description: '1000+ words - Deep dive' }
  ];

  const complexityOptions = [
    { value: 'simplified', label: 'Simplified', description: 'Simple explanations, avoid jargon' },
    { value: 'balanced', label: 'Balanced', description: 'Mix of simplicity and depth' },
    { value: 'advanced', label: 'Advanced', description: 'Assume prior knowledge' },
    { value: 'expert', label: 'Expert', description: 'Deep technical nuances' }
  ];

  const exampleOptions = [
    { value: 'real-world', label: 'Real-World', description: 'Practical scenarios and cases' },
    { value: 'theoretical', label: 'Theoretical', description: 'Concepts and principles' },
    { value: 'code-focused', label: 'Code-Focused', description: 'Technical implementations' },
    { value: 'business-focused', label: 'Business-Focused', description: 'Professional use cases' },
    { value: 'mixed', label: 'Mixed', description: 'Variety of example types' }
  ];

  const approachOptions = [
    { value: 'hands-on', label: 'Hands-On', description: 'Practice and exercises' },
    { value: 'conceptual', label: 'Conceptual', description: 'Understanding principles' },
    { value: 'visual', label: 'Visual', description: 'Diagrams and visual aids' },
    { value: 'analytical', label: 'Analytical', description: 'Break down systematically' },
    { value: 'balanced', label: 'Balanced', description: 'Mix of approaches' }
  ];

  const PreferenceSection = ({ 
    title, 
    description, 
    sectionKey, 
    options, 
    currentValue 
  }: { 
    title: string; 
    description: string; 
    sectionKey: string;
    options: Array<{ value: string; label: string; description: string }>;
    currentValue?: string | null;
  }) => {
    const isExpanded = expandedSection === sectionKey;
    
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="text-left">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            <p className="text-sm font-light text-gray-600 mt-1">{description}</p>
            {currentValue && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-medium text-brand-purple">
                  Selected: {options.find(o => o.value === currentValue)?.label}
                </p>
                {hasProfileDefaults && profileDefaults && profileDefaults[sectionKey as keyof ContentPreferencesData] === currentValue && (
                  <span className="text-xs px-2 py-0.5 bg-brand-purple/10 text-brand-purple rounded-full font-medium">
                    Default
                  </span>
                )}
              </div>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updatePreference(sectionKey as keyof ContentPreferencesData, option.value as any);
                    setExpandedSection(null);
                  }}
                  className={`p-3 rounded-lg border-2 text-left transition-all relative ${
                    currentValue === option.value
                      ? 'border-brand-purple bg-brand-purple/5'
                      : hasProfileDefaults && profileDefaults && profileDefaults[sectionKey as keyof ContentPreferencesData] === option.value
                      ? 'border-brand-purple/30 bg-brand-purple/5 hover:border-brand-purple/50'
                      : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{option.label}</div>
                      <div className="text-xs font-light text-gray-600 mt-1">{option.description}</div>
                    </div>
                    {hasProfileDefaults && profileDefaults && profileDefaults[sectionKey as keyof ContentPreferencesData] === option.value && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-brand-purple/20 text-brand-purple rounded-full font-medium flex-shrink-0">
                        Your Default
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const hasAnyPreference = Object.values(preferences).some(v => v !== null && v !== undefined);
  const hasEnoughData = profile && profile.totalLearningTimeMinutes >= 30 && profile.avgSuccessRate > 0;

  return (
    <div className="space-y-6">
      {hasProfileDefaults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 rounded-xl border border-brand-purple/20"
        >
          <p className="text-sm font-medium text-brand-black">
            Your profile defaults are pre-selected below.
          </p>
          <p className="text-xs font-light text-brand-black/60 mt-1">
            You can adjust them for this project or continue with your defaults.
          </p>
        </motion.div>
      )}
      {!hasProfileDefaults && hasEnoughData && autoDetectPreferences && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 rounded-xl border border-brand-purple/20"
        >
          <p className="text-sm font-medium text-brand-black">
            We've automatically personalized your preferences based on your learning patterns.
          </p>
          <p className="text-xs font-light text-brand-black/60 mt-1">
            You can adjust these below if needed.
          </p>
        </motion.div>
      )}

      <div className="space-y-4 max-w-4xl mx-auto">
        <PreferenceSection
          title="Writing Style"
          description="How should the content be written?"
          sectionKey="content_style"
          options={styleOptions}
          currentValue={preferences.content_style}
        />

        <PreferenceSection
          title="Content Length"
          description="How detailed should each section be?"
          sectionKey="content_length"
          options={lengthOptions}
          currentValue={preferences.content_length}
        />

        <PreferenceSection
          title="Complexity Level"
          description="What level of technical depth?"
          sectionKey="content_complexity"
          options={complexityOptions}
          currentValue={preferences.content_complexity}
        />

        <PreferenceSection
          title="Example Types"
          description="What kind of examples do you prefer?"
          sectionKey="preferred_examples"
          options={exampleOptions}
          currentValue={preferences.preferred_examples}
        />

        <PreferenceSection
          title="Learning Approach"
          description="How do you learn best?"
          sectionKey="learning_approach"
          options={approachOptions}
          currentValue={preferences.learning_approach}
        />
      </div>

      <div className="flex flex-col gap-4 pt-6 max-w-2xl mx-auto">
        {hasProfileDefaults && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onSkip}
            className="w-full px-8 py-4 text-base font-medium text-white brand-gradient rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Use Your Defaults
          </motion.button>
        )}
        <div className="flex gap-4 justify-center">
          {!hasProfileDefaults && (
            <button
              onClick={onSkip}
              className="px-6 py-2.5 text-sm font-light text-gray-600 hover:text-gray-900 transition-colors"
            >
              Use Defaults
            </button>
          )}
          <button
            onClick={onContinue}
            className={`px-8 py-2.5 text-sm font-medium text-white brand-gradient rounded-lg hover:opacity-90 transition-opacity shadow-sm ${
              hasProfileDefaults ? 'flex-1' : ''
            }`}
          >
            {hasAnyPreference ? 'Continue with Preferences' : 'Continue with Defaults'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPreferences;

