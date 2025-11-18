import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export interface AggregatedContentPreferences {
  contentStyle: {
    value: 'conversational' | 'formal' | 'technical' | 'storytelling' | 'practical' | null;
    frequency: number;
    percentage: number;
  } | null;
  contentLength: {
    value: 'brief' | 'standard' | 'detailed' | 'comprehensive' | null;
    frequency: number;
    percentage: number;
    wordRange: string;
  } | null;
  contentComplexity: {
    value: 'simplified' | 'balanced' | 'advanced' | 'expert' | null;
    frequency: number;
    percentage: number;
  } | null;
  preferredExamples: {
    value: 'real-world' | 'theoretical' | 'code-focused' | 'business-focused' | 'mixed' | null;
    frequency: number;
    percentage: number;
  } | null;
  learningApproach: {
    value: 'hands-on' | 'conceptual' | 'visual' | 'analytical' | 'balanced' | null;
    frequency: number;
    percentage: number;
  } | null;
  totalProjects: number;
  projectsWithPreferences: number;
}

const LENGTH_WORD_RANGES: Record<string, string> = {
  brief: '300-400 words',
  standard: '600-700 words',
  detailed: '800-1000 words',
  comprehensive: '1000+ words',
};

export const useUserContentPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AggregatedContentPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('learning_paths')
          .select('content_style, content_length, content_complexity, preferred_examples, learning_approach')
          .eq('user_id', user.id);

        if (fetchError) {
          // If columns don't exist yet (400 error), silently return null preferences
          if (fetchError.code === '42703' || fetchError.message?.includes('column') || fetchError.message?.includes('does not exist')) {
            console.warn('Content preference columns not yet migrated. Run: supabase db push');
            setPreferences({
              contentStyle: null,
              contentLength: null,
              contentComplexity: null,
              preferredExamples: null,
              learningApproach: null,
              totalProjects: 0,
              projectsWithPreferences: 0,
            });
            setIsLoading(false);
            return;
          }
          throw fetchError;
        }

        if (!data || data.length === 0) {
          setPreferences({
            contentStyle: null,
            contentLength: null,
            contentComplexity: null,
            preferredExamples: null,
            learningApproach: null,
            totalProjects: 0,
            projectsWithPreferences: 0,
          });
          setIsLoading(false);
          return;
        }

        const totalProjects = data.length;
        const projectsWithPreferences = data.filter(
          (p) => p.content_style || p.content_length || p.content_complexity || p.preferred_examples || p.learning_approach
        ).length;

        // Aggregate content_style
        const styleCounts = new Map<string, number>();
        data.forEach((p) => {
          if (p.content_style) {
            styleCounts.set(p.content_style, (styleCounts.get(p.content_style) || 0) + 1);
          }
        });
        const mostCommonStyle = Array.from(styleCounts.entries()).sort((a, b) => b[1] - a[1])[0];
        const contentStyle = mostCommonStyle
          ? {
              value: mostCommonStyle[0] as AggregatedContentPreferences['contentStyle']['value'],
              frequency: mostCommonStyle[1],
              percentage: Math.round((mostCommonStyle[1] / totalProjects) * 100),
            }
          : null;

        // Aggregate content_length
        const lengthCounts = new Map<string, number>();
        data.forEach((p) => {
          if (p.content_length) {
            lengthCounts.set(p.content_length, (lengthCounts.get(p.content_length) || 0) + 1);
          }
        });
        const mostCommonLength = Array.from(lengthCounts.entries()).sort((a, b) => b[1] - a[1])[0];
        const contentLength = mostCommonLength
          ? {
              value: mostCommonLength[0] as AggregatedContentPreferences['contentLength']['value'],
              frequency: mostCommonLength[1],
              percentage: Math.round((mostCommonLength[1] / totalProjects) * 100),
              wordRange: LENGTH_WORD_RANGES[mostCommonLength[0]] || '',
            }
          : null;

        // Aggregate content_complexity
        const complexityCounts = new Map<string, number>();
        data.forEach((p) => {
          if (p.content_complexity) {
            complexityCounts.set(p.content_complexity, (complexityCounts.get(p.content_complexity) || 0) + 1);
          }
        });
        const mostCommonComplexity = Array.from(complexityCounts.entries()).sort((a, b) => b[1] - a[1])[0];
        const contentComplexity = mostCommonComplexity
          ? {
              value: mostCommonComplexity[0] as AggregatedContentPreferences['contentComplexity']['value'],
              frequency: mostCommonComplexity[1],
              percentage: Math.round((mostCommonComplexity[1] / totalProjects) * 100),
            }
          : null;

        // Aggregate preferred_examples
        const examplesCounts = new Map<string, number>();
        data.forEach((p) => {
          if (p.preferred_examples) {
            examplesCounts.set(p.preferred_examples, (examplesCounts.get(p.preferred_examples) || 0) + 1);
          }
        });
        const mostCommonExamples = Array.from(examplesCounts.entries()).sort((a, b) => b[1] - a[1])[0];
        const preferredExamples = mostCommonExamples
          ? {
              value: mostCommonExamples[0] as AggregatedContentPreferences['preferredExamples']['value'],
              frequency: mostCommonExamples[1],
              percentage: Math.round((mostCommonExamples[1] / totalProjects) * 100),
            }
          : null;

        // Aggregate learning_approach
        const approachCounts = new Map<string, number>();
        data.forEach((p) => {
          if (p.learning_approach) {
            approachCounts.set(p.learning_approach, (approachCounts.get(p.learning_approach) || 0) + 1);
          }
        });
        const mostCommonApproach = Array.from(approachCounts.entries()).sort((a, b) => b[1] - a[1])[0];
        const learningApproach = mostCommonApproach
          ? {
              value: mostCommonApproach[0] as AggregatedContentPreferences['learningApproach']['value'],
              frequency: mostCommonApproach[1],
              percentage: Math.round((mostCommonApproach[1] / totalProjects) * 100),
            }
          : null;

        setPreferences({
          contentStyle,
          contentLength,
          contentComplexity,
          preferredExamples,
          learningApproach,
          totalProjects,
          projectsWithPreferences,
        });
      } catch (err) {
        console.error('Error fetching user content preferences:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  return { preferences, isLoading, error };
};

