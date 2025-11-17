// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/utils.ts';
import { getAuthContext } from '../_shared/auth.ts';

interface SkillGap {
  skill: string;
  learned: boolean;
  demonstrated: boolean;
  timesLearned: number;
  timesDemonstrated: number;
  avgScore?: number;
  gapType: 'knowledge_gap' | 'application_gap' | 'mastery_gap';
}

interface SkillGapsResponse {
  gaps: SkillGap[];
  strengths: string[]; // Skills with high scores
  opportunities: string[]; // Skills learned but not demonstrated
  recommendations: {
    topic: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
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

    const [{ data: learningPaths }, { data: workOutputs }] = await Promise.all([
      supabaseClient
        .from('learning_paths')
        .select('topic,id,tags,is_completed')
        .eq('user_id', user.id),
      supabaseClient
        .from('work_outputs')
        .select('skill_tags_used, auto_score, manual_score, project_type')
        .eq('user_id', user.id),
    ]);

    const signals = buildSkillSignals(learningPaths || [], workOutputs || []);
    const response = buildSkillGapResponse(signals);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in get-skill-gaps:', error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message || 'Unexpected error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Common stop words that shouldn't be treated as skills
const STOP_WORDS = new Set([
  'what', 'are', 'the', 'and', 'for', 'with', 'from', 'that', 'this', 'have',
  'been', 'will', 'would', 'should', 'could', 'about', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within',
  'without', 'best', 'practices', 'guide', 'tutorial', 'introduction', 'learn',
  'learning', 'master', 'mastering', 'complete', 'comprehensive', 'ultimate'
]);

function normalizeSkillName(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function isValidSkill(skill: string): boolean {
  const normalized = normalizeSkillName(skill);
  if (normalized.length < 2) return false;
  if (STOP_WORDS.has(normalized)) return false;
  // Don't treat single common words as skills
  if (normalized.split(/\s+/).length === 1 && normalized.length < 4) return false;
  return true;
}

function formatSkillName(skill: string): string {
  // Capitalize each word properly
  return skill
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildSkillSignals(learningPaths: any[], workOutputs: any[]) {
  const learnedSkills: Record<string, number> = {};
  
  learningPaths
    .filter((path) => path.is_completed)
    .forEach((path) => {
      // Priority 1: Use tags (structured skill names)
      if (Array.isArray(path.tags) && path.tags.length > 0) {
        path.tags.forEach((tag: string) => {
          const normalized = normalizeSkillName(tag);
          if (isValidSkill(normalized)) {
            learnedSkills[normalized] = (learnedSkills[normalized] || 0) + 1;
          }
        });
      }
      
      // Priority 2: Use full topic name as a skill (if it's meaningful)
      if (path.topic) {
        const topicNormalized = normalizeSkillName(path.topic);
        // Only use full topic if it's not too long and doesn't contain question words
        if (isValidSkill(topicNormalized) && 
            !topicNormalized.includes('?') && 
            topicNormalized.split(/\s+/).length <= 5) {
          learnedSkills[topicNormalized] = (learnedSkills[topicNormalized] || 0) + 1;
        }
      }
      
      // Priority 3: Extract meaningful phrases from topic (only if no tags)
      if ((!path.tags || path.tags.length === 0) && path.topic) {
        const topicLower = path.topic.toLowerCase();
        // Look for common skill patterns (2-3 word phrases)
        const words = topicLower.split(/\s+/).filter(w => w.length > 2);
        for (let i = 0; i < words.length - 1; i++) {
          // Try 2-word phrases
          const phrase = `${words[i]} ${words[i + 1]}`;
          if (isValidSkill(phrase) && !STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
            learnedSkills[phrase] = (learnedSkills[phrase] || 0) + 1;
          }
          // Try 3-word phrases if available
          if (i < words.length - 2) {
            const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
            if (isValidSkill(phrase3) && 
                !STOP_WORDS.has(words[i]) && 
                !STOP_WORDS.has(words[i + 1]) && 
                !STOP_WORDS.has(words[i + 2])) {
              learnedSkills[phrase3] = (learnedSkills[phrase3] || 0) + 1;
            }
          }
        }
      }
    });

  const demonstratedSkills: Record<string, { count: number; scores: number[] }> = {};
  workOutputs.forEach((output) => {
    if (Array.isArray(output.skill_tags_used)) {
      output.skill_tags_used.forEach((skill: string) => {
        const normalized = normalizeSkillName(skill);
        if (isValidSkill(normalized)) {
          if (!demonstratedSkills[normalized]) {
            demonstratedSkills[normalized] = { count: 0, scores: [] };
          }
          demonstratedSkills[normalized].count += 1;
          const score = Number(output.auto_score ?? output.manual_score);
          if (Number.isFinite(score)) {
            demonstratedSkills[normalized].scores.push(score);
          }
        }
      });
    }
  });

  return { learnedSkills, demonstratedSkills };
}

function buildSkillGapResponse(signals: ReturnType<typeof buildSkillSignals>): SkillGapsResponse {
  const { learnedSkills, demonstratedSkills } = signals;
  const allSkills = new Set([...Object.keys(learnedSkills), ...Object.keys(demonstratedSkills)]);

  const gaps: SkillGap[] = Array.from(allSkills).map((skill) => {
    const learned = (learnedSkills[skill] || 0) > 0;
    const demonstratedCount = demonstratedSkills[skill]?.count || 0;
    const demonstrated = demonstratedCount > 0;
    const avgScore = demonstratedSkills[skill]?.scores?.length
      ? demonstratedSkills[skill].scores.reduce((sum, value) => sum + value, 0) /
        demonstratedSkills[skill].scores.length
      : undefined;

    let gapType: 'knowledge_gap' | 'application_gap' | 'mastery_gap' = 'knowledge_gap';
    if (learned && !demonstrated) {
      gapType = 'application_gap';
    } else if (learned && demonstrated && avgScore && avgScore < 70) {
      gapType = 'mastery_gap';
    }

    return {
      skill: formatSkillName(skill),
      learned,
      demonstrated,
      timesLearned: learnedSkills[skill] || 0,
      timesDemonstrated: demonstratedCount,
      avgScore: avgScore ? Math.round(avgScore * 10) / 10 : undefined,
      gapType,
    };
  });

  const strengths = gaps
    .filter((gap) => (gap.avgScore || 0) >= 85)
    .map((gap) => gap.skill)
    .slice(0, 5);

  const opportunities = gaps
    .filter((gap) => gap.learned && !gap.demonstrated && gap.timesLearned >= 1)
    .map((gap) => gap.skill)
    .slice(0, 5);

  const recommendations = [
    ...opportunities.map((skill) => ({
      topic: `Build a ${skill} project`,
      reason: `You've learned ${skill} but haven't demonstrated it yet.`,
      priority: 'high' as const,
    })),
    ...gaps
      .filter((gap) => gap.gapType === 'mastery_gap' && gap.avgScore)
      .map((gap) => ({
        topic: `Deepen ${gap.skill} mastery`,
        reason: `Recent ${gap.skill} work averages ${gap.avgScore}%. Reinforce the fundamentals.`,
        priority: 'medium' as const,
      })),
  ].slice(0, 5);

  return {
    gaps: gaps
      .sort((a, b) => {
        if (a.gapType === 'application_gap' && b.gapType !== 'application_gap') return -1;
        if (b.gapType === 'application_gap' && a.gapType !== 'application_gap') return 1;
        return b.timesLearned - a.timesLearned;
      })
      .slice(0, 20),
    strengths,
    opportunities,
    recommendations,
  };
}

