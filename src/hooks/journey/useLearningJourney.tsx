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

      // Expect server to return { topics: string[] }
      const topicNames: unknown = response.data && typeof response.data === 'object'
        ? (response.data as any).topics
        : undefined;

      if (!Array.isArray(topicNames) || topicNames.some(t => typeof t !== 'string')) {
        console.error('Invalid response structure for topics. Expected { topics: string[] } but got:', response.data);
        throw new Error('Invalid topics format from AI');
      }

      // Map simple names to Topic objects with defaults for the UI
      const topicsArray = topicNames.map((name: string, idx: number) => ({
        id: `topic-${idx + 1}-${Math.random().toString(36).slice(2, 8)}`,
        title: name,
        description: '',
        difficulty: 'beginner' as const,
        timeCommitment: '10-20 hours',
        careerPaths: [],
        trending: false,
        matchScore: 80,
      }));

      console.log('Topics array to set:', topicsArray);
      updateJourneyData({ topics: topicsArray });
    } catch (err) {
      console.error('Error generating topics:', err);
      setError(err.message || 'Failed to generate topics');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSubTopics = async (topic: Topic) => {
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

      console.log('Subtopics response from edge function:', response.data);

      // Expect { skills: string[] } (reusing skills endpoint for subtopics)
      const subtopicNames: unknown = response.data && typeof response.data === 'object'
        ? (response.data as any).skills
        : undefined;

      if (!Array.isArray(subtopicNames) || subtopicNames.some(s => typeof s !== 'string')) {
        console.error('Invalid subtopics response structure. Expected { skills: string[] } but got:', response.data);
        throw new Error('No subtopics generated');
      }

      // Map subtopics to Topic objects
      const subtopicsArray = subtopicNames.map((name: string, idx: number) => ({
        id: `topic-${idx + 1}-${Math.random().toString(36).slice(2, 8)}`,
        title: name,
        description: '',
        difficulty: 'beginner' as const,
        timeCommitment: '10-20 hours',
        careerPaths: [],
        trending: false,
        matchScore: 80,
      }));

      updateJourneyData({ topics: subtopicsArray });
    } catch (err) {
      console.error('Error generating subtopics:', err);
      setError(err.message || 'Failed to generate subtopics');
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
      if (planData && typeof planData === 'object') {
        if ('data' in planData) {
          planData = (planData as any).data;
        } else if ('plan' in planData) {
          planData = (planData as any).plan;
        }
      }

      if (!planData || typeof planData !== 'object') {
        throw new Error('No learning plan generated');
      }

      // Expand minimal plan into full shape with defaults
      const expandedPlan: LearningPlanData = {
        title: (planData as any).title || 'Your Learning Plan',
        description: (planData as any).description || '',
        totalDuration: (planData as any).totalDuration || '8 weeks',
        weeklyCommitment: (planData as any).weeklyCommitment || '6-10 hours',
        milestones: Array.isArray((planData as any).milestones) ? (planData as any).milestones : [],
        firstProject: (planData as any).firstProject || {
          title: 'Starter Project',
          description: '',
          skills: journeyData.selectedSkills.map(s => s.name),
          estimatedTime: '6 hours'
        },
        resources: Array.isArray((planData as any).resources) ? (planData as any).resources : [],
        nextSteps: Array.isArray((planData as any).nextSteps) ? (planData as any).nextSteps : [],
      };

      updateJourneyData({ learningPlan: expandedPlan });
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
    generateSubTopics,
    generateLearningPlan,
    resetJourney,
    isLoading,
    error,
  };
};