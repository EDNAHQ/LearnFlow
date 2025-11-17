// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/utils.ts';
import { getAuthContext } from '../_shared/auth.ts';

interface PromptInsight {
  topic: string;
  frequency: number;
  category: string;
  samplePrompts: string[];
  hasPath: boolean; // Whether user created a learning path for this
  lastAsked: string;
}

interface PromptInsightsResponse {
  insights: PromptInsight[];
  topCategories: { category: string; count: number }[];
  unansweredQuestions: PromptInsight[];
  suggestedTopics: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authContext = await getAuthContext(req);
    if ('errorResponse' in authContext) {
      return authContext.errorResponse;
    }

    const { supabaseClient, user } = authContext;

    const [{ data: promptLogs }, { data: learningPaths }] = await Promise.all([
      supabaseClient
        .from('prompt_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(300),
      supabaseClient
        .from('learning_paths')
        .select('topic,id')
        .eq('user_id', user.id),
    ]);

    const response = buildPromptInsights(promptLogs || [], learningPaths || []);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in get-prompt-insights:', error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message || 'Unexpected error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function buildPromptInsights(promptLogs: any[], learningPaths: any[]): PromptInsightsResponse {
  if (!promptLogs.length) {
    return { insights: [], topCategories: [], unansweredQuestions: [], suggestedTopics: [] };
  }

  const pathTopics = new Set(learningPaths.map((path) => path.topic.toLowerCase()));
  const topicGroups: Record<string, any[]> = {};
  const categoryCounts: Record<string, number> = {};

  promptLogs.forEach((prompt) => {
    const topic = inferTopic(prompt);
    if (!topicGroups[topic]) {
      topicGroups[topic] = [];
    }
    topicGroups[topic].push(prompt);

    if (prompt.category) {
      categoryCounts[prompt.category] = (categoryCounts[prompt.category] || 0) + 1;
    }
  });

  const insights: PromptInsight[] = Object.entries(topicGroups)
    .map(([topic, prompts]) => {
      const sorted = prompts.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return {
        topic: capitalize(topic),
        frequency: prompts.length,
        category: prompts[0].category || 'general',
        samplePrompts: sorted.slice(0, 3).map((prompt) => prompt.prompt_text.slice(0, 120)),
        hasPath: pathTopics.has(topic.toLowerCase()),
        lastAsked: sorted[0].timestamp,
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const unansweredQuestions = insights.filter((insight) => !insight.hasPath && insight.frequency >= 2).slice(0, 5);
  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const suggestedTopics = unansweredQuestions.map((insight) => insight.topic).slice(0, 5);

  return {
    insights,
    topCategories,
    unansweredQuestions,
    suggestedTopics,
  };
}

function inferTopic(prompt: any) {
  const text = prompt.prompt_text?.toLowerCase() || '';
  const keywords = [
    'python',
    'javascript',
    'react',
    'typescript',
    'api',
    'dashboard',
    'automation',
    'data',
    'sql',
    'machine learning',
    'ai',
    'database',
  ];

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }

  return prompt.category?.toLowerCase() || 'general';
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

