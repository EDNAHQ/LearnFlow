import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/ui';
import { X } from 'lucide-react';

interface OnboardingData {
  // Step 1: Goals
  goalsShortTerm: string;
  goalsLongTerm: string;
  immediateChallenge: string;
  timeHorizon: string;
  
  // Step 2: Role & Context
  role: string;
  industry: string;
  function: string;
  businessContext: string;
  
  // Step 3: Experience & Skills
  experienceLevel: 'beginner' | 'competent' | 'builder';
  skillData: number;
  skillApps: number;
  skillAutomation: number;
  skillAiReasoning: number;
  
  // Step 4: Tools
  currentTools: string[];
}

const AVAILABLE_TOOLS = [
  'PowerBI',
  'Fabric',
  'SQL',
  'Python',
  'Excel',
  'Make',
  'Zapier',
  'Power Automate',
  'Streamlit',
  'ChatGPT',
  'Claude',
  'Gemini'
];

const TIME_HORIZONS = [
  { value: '1-week', label: 'This week' },
  { value: '1-month', label: 'This month' },
  { value: '3-months', label: 'Next 3 months' },
  { value: '6-months', label: 'Next 6 months' },
  { value: '1-year', label: 'This year' },
  { value: 'long-term', label: 'Long-term growth' }
];

interface CapabilityOnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

const CapabilityOnboardingWizard: React.FC<CapabilityOnboardingWizardProps> = ({ isOpen, onComplete }) => {
  const { user } = useAuth();
  const { updateProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    goalsShortTerm: '',
    goalsLongTerm: '',
    immediateChallenge: '',
    timeHorizon: '',
    role: '',
    industry: '',
    function: '',
    businessContext: '',
    experienceLevel: 'beginner',
    skillData: 3,
    skillApps: 3,
    skillAutomation: 3,
    skillAiReasoning: 3,
    currentTools: []
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleToolToggle = (tool: string) => {
    setData(prev => ({
      ...prev,
      currentTools: prev.currentTools.includes(tool)
        ? prev.currentTools.filter(t => t !== tool)
        : [...prev.currentTools, tool]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Ensure user_profiles exists, create if it doesn't
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create user_profiles entry first
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({ user_id: user.id });

        if (createError) throw createError;
      }

      // Update user_profiles with all collected data
      const { error } = await updateProfile({
        goals_short_term: data.goalsShortTerm,
        goals_long_term: data.goalsLongTerm,
        immediate_challenge: data.immediateChallenge,
        time_horizon: data.timeHorizon,
        role: data.role,
        industry: data.industry,
        function: data.function,
        business_context: data.businessContext,
        experience_level: data.experienceLevel,
        skill_data: data.skillData,
        skill_apps: data.skillApps,
        skill_automation: data.skillAutomation,
        skill_ai_reasoning: data.skillAiReasoning,
        current_tools: data.currentTools,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Welcome to LearnFlow!",
        description: "Your personalized learning journey starts now.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.goalsShortTerm.trim().length > 0 && data.timeHorizon.length > 0;
      case 2:
        return data.role.trim().length > 0 && data.industry.trim().length > 0;
      case 3:
        return true; // Skills always have defaults
      case 4:
        return true; // Tools are optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <GoalsStep data={data} updateData={updateData} />;
      case 2:
        return <RoleContextStep data={data} updateData={updateData} />;
      case 3:
        return <SkillsStep data={data} updateData={updateData} />;
      case 4:
        return <ToolsStep data={data} updateData={updateData} handleToolToggle={handleToolToggle} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={onComplete}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-medium text-gradient mb-2">
              Let's personalize your learning journey
            </h2>
            <p className="text-sm font-light text-gray-600">
              Step {currentStep} of 4
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full brand-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="text-gray-600"
          >
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="brand-gradient text-white"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="brand-gradient text-white"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Step 1: Goals
const GoalsStep: React.FC<{ data: OnboardingData; updateData: (updates: Partial<OnboardingData>) => void }> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">What do you want to achieve?</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short-term goal
            </label>
            <Textarea
              value={data.goalsShortTerm}
              onChange={(e) => updateData({ goalsShortTerm: e.target.value })}
              placeholder="What do you want to learn or build in the near term?"
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Long-term goal
            </label>
            <Textarea
              value={data.goalsLongTerm}
              onChange={(e) => updateData({ goalsLongTerm: e.target.value })}
              placeholder="Where do you want to be in your career or skills?"
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immediate challenge
            </label>
            <Textarea
              value={data.immediateChallenge}
              onChange={(e) => updateData({ immediateChallenge: e.target.value })}
              placeholder="What's blocking you right now?"
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time horizon
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIME_HORIZONS.map((horizon) => (
                <button
                  key={horizon.value}
                  onClick={() => updateData({ timeHorizon: horizon.value })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    data.timeHorizon === horizon.value
                      ? 'border-brand-purple bg-brand-purple/5'
                      : 'border-gray-200 hover:border-brand-purple/50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{horizon.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 2: Role & Context
const RoleContextStep: React.FC<{ data: OnboardingData; updateData: (updates: Partial<OnboardingData>) => void }> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tell us about your role</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your role
            </label>
            <Input
              value={data.role}
              onChange={(e) => updateData({ role: e.target.value })}
              placeholder="e.g., Data Analyst, Business Intelligence Developer, Automation Specialist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <Input
              value={data.industry}
              onChange={(e) => updateData({ industry: e.target.value })}
              placeholder="e.g., Finance, Healthcare, Retail, Technology"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team/Function
            </label>
            <Input
              value={data.function}
              onChange={(e) => updateData({ function: e.target.value })}
              placeholder="e.g., Analytics, Operations, IT, Marketing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business context
            </label>
            <Textarea
              value={data.businessContext}
              onChange={(e) => updateData({ businessContext: e.target.value })}
              placeholder="What kind of work do you do? What problems are you solving?"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 3: Skills
const SkillsStep: React.FC<{ data: OnboardingData; updateData: (updates: Partial<OnboardingData>) => void }> = ({ data, updateData }) => {
  const SkillSlider = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <span className="text-sm font-medium text-brand-purple">{value}/5</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-purple"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Beginner</span>
          <span>Expert</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">How would you rate your current skills?</h3>
        <p className="text-sm font-light text-gray-600 mb-6">
          This helps us personalize your learning path. Don't worry about being precise—your self-perception is what matters.
        </p>
        
        <div className="space-y-6">
          <SkillSlider
            label="Data & Analytics"
            value={data.skillData}
            onChange={(value) => updateData({ skillData: value })}
          />
          <SkillSlider
            label="Application Development"
            value={data.skillApps}
            onChange={(value) => updateData({ skillApps: value })}
          />
          <SkillSlider
            label="Automation & Workflows"
            value={data.skillAutomation}
            onChange={(value) => updateData({ skillAutomation: value })}
          />
          <SkillSlider
            label="AI Reasoning & Prompting"
            value={data.skillAiReasoning}
            onChange={(value) => updateData({ skillAiReasoning: value })}
          />
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Experience level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['beginner', 'competent', 'builder'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateData({ experienceLevel: level })}
                className={`p-4 rounded-xl border-2 text-left transition-all capitalize ${
                  data.experienceLevel === level
                    ? 'border-brand-purple bg-brand-purple/5'
                    : 'border-gray-200 hover:border-brand-purple/50'
                }`}
              >
                <span className="text-sm font-medium text-gray-900">{level}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 4: Tools
const ToolsStep: React.FC<{ 
  data: OnboardingData; 
  updateData: (updates: Partial<OnboardingData>) => void;
  handleToolToggle: (tool: string) => void;
}> = ({ data, handleToolToggle }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">What tools do you use?</h3>
        <p className="text-sm font-light text-gray-600 mb-6">
          Select all that apply. This helps us recommend relevant content and projects.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_TOOLS.map((tool) => {
            const isSelected = data.currentTools.includes(tool);
            return (
              <button
                key={tool}
                onClick={() => handleToolToggle(tool)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-brand-purple bg-brand-purple/5'
                    : 'border-gray-200 hover:border-brand-purple/50'
                }`}
              >
                <span className="text-sm font-medium text-gray-900">{tool}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CapabilityOnboardingWizard;

