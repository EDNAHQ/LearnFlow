// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/utils.ts';
import { getAuthContext } from '../_shared/auth.ts';

interface PredictiveRecommendation {
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  signals: string[];
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

    const [
      { data: promptLogs },
      { data: progressTracking },
      { data: learningPaths },
      { data: workOutputs },
      { data: profile },
    ] = await Promise.all([
      supabaseClient
        .from('prompt_logs')
        .select('prompt_text, category, timestamp, path_id')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(200),
      supabaseClient
        .from('progress_tracking')
        .select('module_id, remediation_needed, success_rate')
        .eq('user_id', user.id),
      supabaseClient
        .from('learning_paths')
        .select('topic,id,is_completed,tags')
        .eq('user_id', user.id),
      supabaseClient
        .from('work_outputs')
        .select('skill_tags_used')
        .eq('user_id', user.id),
      supabaseClient
        .from('user_profiles')
        .select('goals_short_term,goals_long_term,immediate_challenge,role,industry')
        .eq('user_id', user.id)
        .single(),
    ]);

    const recommendations = buildRecommendations({
      promptLogs: promptLogs || [],
      progressTracking: progressTracking || [],
      learningPaths: learningPaths || [],
      workOutputs: workOutputs || [],
      profile,
    });

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in get-predictive-recommendations:', error);
    return new Response(JSON.stringify({ error: (error as Error)?.message || 'Unexpected error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

function buildRecommendations({
  promptLogs,
  progressTracking,
  learningPaths,
  workOutputs,
  profile,
}: {
  promptLogs: any[];
  progressTracking: any[];
  learningPaths: any[];
  workOutputs: any[];
  profile: any;
}): PredictiveRecommendation[] {
  const promptTopics = extractPromptSignals(promptLogs);
  const strugglingConcepts = extractStrugglingConcepts(progressTracking, learningPaths);
  const skillGaps = extractSkillGaps(learningPaths, workOutputs);
  const goals = [
    profile?.goals_short_term,
    profile?.goals_long_term,
    profile?.immediate_challenge,
  ].filter(Boolean) as string[];

  const recommendations: PredictiveRecommendation[] = [];
  const seenTopics = new Set<string>();

  promptTopics.slice(0, 3).forEach((entry) => {
    if (seenTopics.has(entry.topic)) return;
    seenTopics.add(entry.topic);
    recommendations.push({
      topic: `Deep dive: ${capitalize(entry.topic)}`,
      reason: `You recently asked ${entry.count} questions about ${entry.topic}.`,
      priority: 'high',
      confidence: Math.min(90, 60 + entry.count * 5),
      signals: ['prompt_logs'],
    });
  });

  strugglingConcepts.slice(0, 3).forEach((concept) => {
    if (seenTopics.has(concept.topic)) return;
    seenTopics.add(concept.topic);
    recommendations.push({
      topic: `Reinforce ${concept.topic}`,
      reason: `Recent practice indicated remediation is needed for ${concept.topic}.`,
      priority: 'high',
      confidence: 75,
      signals: ['progress_tracking'],
    });
  });

  skillGaps.slice(0, 3).forEach((skill) => {
    if (seenTopics.has(skill)) return;
    seenTopics.add(skill);
    recommendations.push({
      topic: `Build a ${skill} project`,
      reason: `You've completed theory work for ${skill}, but no recent projects cover it.`,
      priority: 'medium',
      confidence: 65,
      signals: ['skill_gaps'],
    });
  });

  goals.slice(0, 2).forEach((goal) => {
    const normalizedGoal = `Goal: ${goal}`;
    if (seenTopics.has(normalizedGoal)) return;
    seenTopics.add(normalizedGoal);
    recommendations.push({
      topic: normalizedGoal,
      reason: `Progress here supports your stated goal: "${goal}".`,
      priority: 'medium',
      confidence: 55,
      signals: ['user_profile'],
    });
  });

  if (!recommendations.length) {
    return [
      {
        topic: 'Explore a new challenge',
        reason: 'We could not detect recent signals, so this is a great time to pick any topic that inspires you.',
        priority: 'low',
        confidence: 40,
        signals: [],
      },
    ];
  }

  return recommendations;
}

function extractPromptSignals(promptLogs: any[]) {
  const topicCounts: Record<string, number> = {};
  promptLogs
    .filter((prompt) => !prompt.path_id)
    .forEach((prompt) => {
      const topic = inferTopic(prompt.prompt_text || '', prompt.category);
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

function extractStrugglingConcepts(progressTracking: any[], learningPaths: any[]) {
  const strugglingIds = new Set(
    progressTracking
      .filter((record) => record.remediation_needed || (record.success_rate ?? 0) < 70)
      .map((record) => record.module_id)
      .filter(Boolean)
  );

  return learningPaths
    .filter((path) => strugglingIds.has(path.id))
    .map((path) => ({ topic: path.topic }));
}

function extractSkillGaps(learningPaths: any[], workOutputs: any[]) {
  const learnedSkills = new Set<string>();
  learningPaths
    .filter((path) => path.is_completed)
    .forEach((path) => {
      if (Array.isArray(path.tags)) {
        path.tags.forEach((tag: string) => learnedSkills.add(tag.toLowerCase()));
      }
      path.topic
        ?.toLowerCase()
        .split(/\s+/)
        .forEach((word: string) => {
          if (word.length > 3) learnedSkills.add(word);
        });
    });

  const demonstratedSkills = new Set<string>();
  workOutputs.forEach((output) => {
    if (Array.isArray(output.skill_tags_used)) {
      output.skill_tags_used.forEach((skill: string) => demonstratedSkills.add(skill.toLowerCase()));
    }
  });

  return Array.from(learnedSkills).filter((skill) => !demonstratedSkills.has(skill));
}

function inferTopic(promptText: string, fallbackCategory?: string) {
  const text = promptText.toLowerCase();
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
    'node',
    'next',
    'django',
    'flask',
  ];

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }

  return fallbackCategory?.toLowerCase() || 'general';
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

