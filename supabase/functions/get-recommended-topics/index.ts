// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createAIClient } from '../_shared/ai-provider/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LearningPath {
  id: string;
  topic: string;
  title: string | null;
  created_at: string;
  is_completed: boolean | null;
  user_id: string;
}

interface LearningStep {
  id: string;
  path_id: string;
  title: string;
  completed: boolean | null;
}

interface RecommendedTopic {
  topic: string;
  reason: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth header (optional - we gracefully fallback if missing)
    const authHeader = req.headers.get('Authorization') || '';

    // Create a Supabase client that runs queries in the user's RLS context
    // Use the ANON key and forward the Authorization header
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Get the authenticated user if available
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    // If no authenticated user, return AI/default recommendations immediately
    if (!user || !user.id) {
      const aiRecommendations = await generateAIRecommendations([], []);
      const recommendations = aiRecommendations.length > 0
        ? aiRecommendations
        : generateRecommendations([], []);
      return new Response(
        JSON.stringify({ recommendations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Fetch user's learning paths
    const { data: paths, error: pathsError } = await supabaseClient
      .from('learning_paths')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (pathsError) {
      console.warn('get-recommended-topics: pathsError', pathsError);
    }

    // Fetch learning steps for all paths
    const pathIds = (paths || []).map((p: LearningPath) => p.id);
    let steps: LearningStep[] = [];

    if (pathIds.length > 0) {
      const { data: stepsData, error: stepsError } = await supabaseClient
        .from('learning_steps')
        .select('*')
        .in('path_id', pathIds);

      if (stepsError) {
        console.warn('get-recommended-topics: stepsError', stepsError);
      }
      steps = stepsData || [];
    }

    // Try AI-powered recommendations first
    const aiRecommendations = await generateAIRecommendations(
      (paths as LearningPath[]) || [],
      steps
    );

    // Fallback to rules-based if AI fails or returns nothing
    const recommendations = aiRecommendations.length > 0
      ? aiRecommendations
      : generateRecommendations((paths as LearningPath[]) || [], steps);

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-recommended-topics:', error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message || 'Unexpected error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function generateAIRecommendations(
  paths: LearningPath[],
  steps: LearningStep[]
): Promise<RecommendedTopic[]> {
  try {
    const ai = createAIClient();

    const userSummary = buildUserSummary(paths, steps);

    const systemPrompt = `You are a learning recommendations engine for a product called LearnFlow.
Generate up to 5 actionable learning topic suggestions tailored to the user's recent activity and skill gaps.
Each suggestion MUST be a JSON object with fields: topic (short title), reason (one sentence), category (one of getting_started, continue_learning, next_steps, complementary).
Respond ONLY with a valid JSON array of objects.`;

    const userPrompt = `User learning summary:\n\n${userSummary}\n\nReturn JSON array now.`;

    const response = await ai.chat({
      functionType: 'topic-recommendations',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      responseFormat: 'json_object',
      maxTokens: 800,
      temperature: 0.7,
    });

    const content = response.content;
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      const cleaned = parsed
        .map((r) => ({
          topic: String(r.topic || '').trim(),
          reason: String(r.reason || '').trim(),
          category: String(r.category || 'next_steps').trim(),
        }))
        .filter((r) => r.topic && r.reason && r.category)
        .slice(0, 5);

      return cleaned as RecommendedTopic[];
    }

    return [];
  } catch (err) {
    console.warn('AI recommendations failed, falling back:', err);
    return [];
  }
}

function buildUserSummary(paths: LearningPath[], steps: LearningStep[]): string {
  if (!paths || paths.length === 0) {
    return 'No prior learning history.';
  }

  const recent = paths.slice(0, 5);
  const lines: string[] = [];

  for (const p of recent) {
    const pSteps = steps.filter((s) => s.path_id === p.id);
    const completed = pSteps.filter((s) => s.completed).length;
    lines.push(`- ${p.topic}${p.title ? ` (${p.title})` : ''}: ${completed}/${pSteps.length} steps completed`);
  }

  return lines.join('\n');
}

function generateRecommendations(
  paths: LearningPath[],
  steps: LearningStep[]
): RecommendedTopic[] {
  const recommendations: RecommendedTopic[] = [];

  // If user has no learning history, suggest popular beginner topics
  if (paths.length === 0) {
    return [
      {
        topic: 'JavaScript Fundamentals',
        reason: 'Great starting point for web development',
        category: 'getting_started',
      },
      {
        topic: 'React Basics',
        reason: 'Popular framework for building user interfaces',
        category: 'getting_started',
      },
      {
        topic: 'Python for Beginners',
        reason: 'Versatile language perfect for beginners',
        category: 'getting_started',
      },
      {
        topic: 'Git & Version Control',
        reason: 'Essential skill for all developers',
        category: 'getting_started',
      },
    ];
  }

  // Analyze completed vs in-progress paths
  const completedPaths = paths.filter((p) => p.is_completed);
  const inProgressPaths = paths.filter((p) => !p.is_completed);

  // Get topics from user's learning history
  const userTopics = paths.map((p) => p.topic.toLowerCase());
  const recentTopics = paths.slice(0, 5).map((p) => p.topic.toLowerCase());

  // Topic relationships and next steps
  const topicMap: { [key: string]: string[] } = {
    javascript: ['TypeScript', 'Node.js', 'React Advanced Patterns'],
    typescript: ['Advanced TypeScript', 'Type-Safe APIs', 'React with TypeScript'],
    react: ['Next.js', 'React Query', 'State Management with Redux'],
    python: ['Django', 'FastAPI', 'Data Science with Python'],
    'machine learning': ['Deep Learning', 'Neural Networks', 'TensorFlow'],
    'system design': ['Microservices Architecture', 'Database Design', 'Cloud Architecture'],
    css: ['Tailwind CSS', 'CSS Grid & Flexbox', 'Responsive Design'],
    'rest api': ['GraphQL', 'API Security', 'Microservices'],
  };

  // Recommend next steps based on what they've learned
  for (const topic of recentTopics) {
    const nextSteps = Object.keys(topicMap).find((key) =>
      topic.includes(key.toLowerCase())
    );

    if (nextSteps && topicMap[nextSteps]) {
      for (const nextTopic of topicMap[nextSteps]) {
        if (!userTopics.some((ut) => ut.includes(nextTopic.toLowerCase()))) {
          recommendations.push({
            topic: nextTopic,
            reason: `Next step after ${paths.find((p) => p.topic.toLowerCase().includes(nextSteps))?.topic || nextSteps}`,
            category: 'next_steps',
          });
        }
      }
    }
  }

  // Recommend completing in-progress paths
  if (inProgressPaths.length > 0) {
    const mostRecentInProgress = inProgressPaths[0];
    const pathSteps = steps.filter((s) => s.path_id === mostRecentInProgress.id);
    const completedSteps = pathSteps.filter((s) => s.completed).length;
    const totalSteps = pathSteps.length;

    if (completedSteps > 0 && completedSteps < totalSteps) {
      recommendations.unshift({
        topic: mostRecentInProgress.topic,
        reason: `Continue your progress (${completedSteps}/${totalSteps} steps completed)`,
        category: 'continue_learning',
      });
    }
  }

  // Add complementary skills
  const hasWebDev = userTopics.some((t) =>
    t.includes('react') || t.includes('javascript') || t.includes('css')
  );
  const hasBackend = userTopics.some((t) =>
    t.includes('node') || t.includes('api') || t.includes('python')
  );

  if (hasWebDev && !hasBackend) {
    recommendations.push({
      topic: 'Building REST APIs',
      reason: 'Complement your frontend skills with backend knowledge',
      category: 'complementary',
    });
  }

  if (hasBackend && !hasWebDev) {
    recommendations.push({
      topic: 'React Fundamentals',
      reason: 'Add frontend development to your skill set',
      category: 'complementary',
    });
  }

  // Limit to 5 recommendations
  return recommendations.slice(0, 5);
}
