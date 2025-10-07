import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Topic } from '../../components/journey/steps/TopicExploration';
import { Skill } from '../../components/journey/steps/SkillBreakdown';
import { LearningPlanData } from '../../components/journey/steps/LearningPlan';

interface JourneyData {
  selectedInterest: { category: string; freeText?: string } | null;
  topics: Topic[];
  selectedTopic: Topic | null;
  skills: Skill[];
  selectedSkills: Skill[];
  learningPlan: LearningPlanData | null;
}

export const useLearningJourney = () => {
  const [journeyData, setJourneyData] = useState<JourneyData>({
    selectedInterest: null,
    topics: [],
    selectedTopic: null,
    skills: [],
    selectedSkills: [],
    learningPlan: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJourneyData = (updates: Partial<JourneyData>) => {
    setJourneyData((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const generateTopics = async (interest: { category: string; freeText?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('generate-learning-journey', {
        body: {
          action: 'generate-topics',
          interest,
        },
      });

      if (response.error) {
        throw response.error;
      }

      console.log('Full response from edge function:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);

      // Check if response.data is the actual array (not wrapped)
      let topicsArray = response.data;

      // If it's wrapped in { success: true, data: [...] }
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        topicsArray = response.data.data;
      }

      // Handle if the AI returned an object with topics property instead of an array
      if (topicsArray && typeof topicsArray === 'object' && !Array.isArray(topicsArray)) {
        if ('topics' in topicsArray) {
          topicsArray = topicsArray.topics;
        } else {
          // Try to convert object values to array if it's indexed like {0: {...}, 1: {...}}
          const keys = Object.keys(topicsArray);
          if (keys.every(key => !isNaN(parseInt(key)))) {
            topicsArray = Object.values(topicsArray);
          }
        }
      }

      if (!topicsArray || !Array.isArray(topicsArray)) {
        console.error('Invalid response structure. Expected array but got:', topicsArray);
        console.error('Full response.data:', response.data);
        console.error('Keys in response.data:', response.data ? Object.keys(response.data) : 'null');
        throw new Error('Invalid topics format from AI');
      }

      console.log('Topics array to set:', topicsArray);
      updateJourneyData({ topics: topicsArray });
    } catch (err) {
      console.error('Error generating topics:', err);
      setError(err.message || 'Failed to generate topics');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSkills = async (topic: Topic) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('generate-learning-journey', {
        body: {
          action: 'generate-skills',
          topic: {
            id: topic.id,
            title: topic.title,
            description: topic.description,
          },
        },
      });

      if (response.error) {
        throw response.error;
      }

      console.log('Skills response from edge function:', response.data);

      let skillsArray = response.data;

      // Handle multiple response formats
      if (skillsArray && typeof skillsArray === 'object' && !Array.isArray(skillsArray)) {
        // Check if it's wrapped in { data: [...] }
        if ('data' in skillsArray) {
          skillsArray = skillsArray.data;
        }
        // Check if it has a skills property
        else if ('skills' in skillsArray) {
          skillsArray = skillsArray.skills;
        }
        // Check if it's a single skill object (has id, name, description properties)
        else if ('id' in skillsArray && 'name' in skillsArray && 'description' in skillsArray) {
          console.log('AI returned single skill object, wrapping in array');
          skillsArray = [skillsArray];
        }
        // Check if it's an indexed object like {0: {...}, 1: {...}}
        else {
          const keys = Object.keys(skillsArray);
          if (keys.length > 0 && keys.every(key => !isNaN(parseInt(key)))) {
            skillsArray = Object.values(skillsArray);
          }
        }
      }

      if (!skillsArray || !Array.isArray(skillsArray)) {
        console.error('Invalid skills response structure. Expected array but got:', skillsArray);
        throw new Error('No skills generated');
      }

      updateJourneyData({ skills: skillsArray });
    } catch (err) {
      console.error('Error generating skills:', err);
      setError(err.message || 'Failed to generate skills');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLearningPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!journeyData.selectedTopic || !journeyData.selectedSkills.length) {
        throw new Error('Please select a topic and skills');
      }

      const response = await supabase.functions.invoke('generate-learning-journey', {
        body: {
          action: 'generate-plan',
          topic: {
            id: journeyData.selectedTopic.id,
            title: journeyData.selectedTopic.title,
            description: journeyData.selectedTopic.description,
          },
          skills: journeyData.selectedSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            level: skill.level,
          })),
        },
      });

      if (response.error) {
        throw response.error;
      }

      console.log('Learning plan response from edge function:', response.data);

      let planData = response.data;

      // Handle multiple response formats
      if (planData && typeof planData === 'object' && 'data' in planData) {
        planData = planData.data;
      }

      if (!planData) {
        throw new Error('No learning plan generated');
      }

      updateJourneyData({ learningPlan: planData });
    } catch (err) {
      console.error('Error generating learning plan:', err);
      setError(err.message || 'Failed to generate learning plan');
    } finally {
      setIsLoading(false);
    }
  };

  const resetJourney = () => {
    setJourneyData({
      selectedInterest: null,
      topics: [],
      selectedTopic: null,
      skills: [],
      selectedSkills: [],
      learningPlan: null,
    });
    setError(null);
  };

  return {
    journeyData,
    updateJourneyData,
    generateTopics,
    generateSkills,
    generateLearningPlan,
    resetJourney,
    isLoading,
    error,
  };
};