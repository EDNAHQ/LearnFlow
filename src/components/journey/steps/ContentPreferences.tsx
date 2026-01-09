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
  const [autoDetected, setAutoDetected] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
    return (
      <div className="space-y-1.5">
        <div>
          <h3 className="text-xs font-medium text-gray-900">{title}</h3>
          <p className="text-[10px] font-light text-gray-600">{description}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updatePreference(sectionKey as keyof ContentPreferencesData, option.value as any);
              }}
              className={`p-2 rounded-lg border-2 text-left transition-all relative ${
                currentValue === option.value
                  ? 'border-brand-purple bg-brand-purple/5'
                  : hasProfileDefaults && profileDefaults && profileDefaults[sectionKey as keyof ContentPreferencesData] === option.value
                  ? 'border-brand-purple/30 bg-brand-purple/5 hover:border-brand-purple/50'
                  : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-xs text-gray-900 mb-0.5 leading-tight">{option.label}</div>
              <div className="text-[10px] font-light text-gray-600 leading-tight line-clamp-2">{option.description}</div>
              {hasProfileDefaults && profileDefaults && profileDefaults[sectionKey as keyof ContentPreferencesData] === option.value && (
                <span className="absolute top-0.5 right-0.5 text-[8px] px-1 py-0.5 bg-brand-purple/20 text-brand-purple rounded-full font-medium">
                  D
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const hasAnyPreference = Object.values(preferences).some(v => v !== null && v !== undefined);
  const hasEnoughData = profile && profile.totalLearningTimeMinutes >= 30 && profile.avgSuccessRate > 0;

  return (
    <div className="space-y-2 h-full flex flex-col">
      {/* Compact banner */}
      {(hasProfileDefaults || (hasEnoughData && autoDetectPreferences)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-2 bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 rounded-lg border border-brand-purple/20 flex-shrink-0"
        >
          <p className="text-xs font-medium text-brand-black leading-tight">
            {hasProfileDefaults 
              ? "Your profile defaults are pre-selected. Adjust below or continue with defaults."
              : "Preferences personalized based on your learning patterns. Adjust if needed."}
          </p>
        </motion.div>
      )}

      {/* Compact preferences grid */}
      <div className="flex-1 min-h-0 space-y-2">
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
    </div>
  );
};

export default ContentPreferences;

