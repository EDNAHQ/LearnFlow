// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/utils.ts';
import { getAuthContext } from '../_shared/auth.ts';
import { createAIClient } from '../_shared/ai-provider/index.ts';

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
      { data: behaviorLogs },
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
      supabaseClient
        .from('behavior_logs')
        .select('action_type, metadata')
        .eq('user_id', user.id)
        .eq('action_type', 'search')
        .order('timestamp', { ascending: false })
        .limit(50),
    ]);

    // Build user context for AI
    const userContext = buildUserContext({
      promptLogs: promptLogs || [],
      progressTracking: progressTracking || [],
      learningPaths: learningPaths || [],
      workOutputs: workOutputs || [],
      profile,
      behaviorLogs: behaviorLogs || [],
    });

    // Get list of topics to exclude (already learned)
    const learnedTopics = learningPaths
      .filter(p => p.topic)
      .map(p => p.topic.toLowerCase());

    // Generate AI-powered recommendations for NEW topics
    const aiRecommendations = await generateAIRecommendations(userContext, learnedTopics);
    
    // Also get data-driven recommendations as backup
    const dataDrivenRecommendations = buildRecommendations({
      promptLogs: promptLogs || [],
      progressTracking: progressTracking || [],
      learningPaths: learningPaths || [],
      workOutputs: workOutputs || [],
      profile,
      behaviorLogs: behaviorLogs || [],
    });

    // Combine: prioritize AI recommendations, fill with data-driven if needed
    const allRecommendations = [...aiRecommendations, ...dataDrivenRecommendations];
    const seenTopics = new Set<string>();
    const finalRecommendations: PredictiveRecommendation[] = [];

    // Add AI recommendations first (they're new topics)
    for (const rec of aiRecommendations) {
      const normalized = rec.topic.toLowerCase();
      if (!seenTopics.has(normalized) && isValidTopic(rec.topic)) {
        seenTopics.add(normalized);
        finalRecommendations.push(rec);
        if (finalRecommendations.length >= 8) break;
      }
    }

    // Fill remaining slots with data-driven recommendations
    for (const rec of dataDrivenRecommendations) {
      if (finalRecommendations.length >= 8) break;
      const normalized = rec.topic.toLowerCase();
      if (!seenTopics.has(normalized) && isValidTopic(rec.topic)) {
        seenTopics.add(normalized);
        finalRecommendations.push(rec);
      }
    }

    // Ensure exactly 8 with fallbacks if needed
    const fallbackTopics = [
      'JavaScript Fundamentals',
      'React Development',
      'Python Programming',
      'API Development',
      'Database Design',
      'Web Development',
      'Data Analysis',
      'Machine Learning',
      'TypeScript Development',
      'Node.js Development',
      'Full-Stack Development',
      'Cloud Architecture',
    ];

    while (finalRecommendations.length < 8) {
      const fallback = fallbackTopics.find(t => {
        const normalized = t.toLowerCase();
        return !seenTopics.has(normalized) && isValidTopic(t);
      });
      if (!fallback) break;
      seenTopics.add(fallback.toLowerCase());
      finalRecommendations.push({
        topic: fallback,
        reason: 'A popular topic that might interest you.',
        priority: 'low',
        confidence: 40,
        signals: ['fallback'],
      });
    }

    return new Response(JSON.stringify({ recommendations: finalRecommendations.slice(0, 8) }), {
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

// Build user context summary for AI
function buildUserContext({
  promptLogs,
  progressTracking,
  learningPaths,
  workOutputs,
  profile,
  behaviorLogs,
}: {
  promptLogs: any[];
  progressTracking: any[];
  learningPaths: any[];
  workOutputs: any[];
  profile: any;
  behaviorLogs: any[];
}): string {
  const lines: string[] = [];
  
  // Learning history
  const completedTopics = learningPaths
    .filter(p => p.is_completed && p.topic)
    .map(p => p.topic);
  const inProgressTopics = learningPaths
    .filter(p => !p.is_completed && p.topic)
    .map(p => p.topic);
  
  if (completedTopics.length > 0) {
    lines.push(`Completed topics: ${completedTopics.slice(0, 10).join(', ')}`);
  }
  if (inProgressTopics.length > 0) {
    lines.push(`In progress: ${inProgressTopics.slice(0, 5).join(', ')}`);
  }
  
  // Recent questions/interests
  const recentPrompts = promptLogs
    .filter(p => !p.path_id)
    .slice(0, 10)
    .map(p => p.prompt_text?.substring(0, 100))
    .filter(Boolean);
  if (recentPrompts.length > 0) {
    lines.push(`Recent questions: ${recentPrompts.slice(0, 5).join('; ')}`);
  }
  
  // Search queries
  const searches = behaviorLogs
    .map(log => log.metadata?.query)
    .filter(Boolean)
    .slice(0, 5);
  if (searches.length > 0) {
    lines.push(`Recent searches: ${searches.join(', ')}`);
  }
  
  // Profile context
  if (profile) {
    if (profile.role) lines.push(`Role: ${profile.role}`);
    if (profile.industry) lines.push(`Industry: ${profile.industry}`);
    if (profile.goals_short_term) lines.push(`Short-term goal: ${profile.goals_short_term}`);
    if (profile.goals_long_term) lines.push(`Long-term goal: ${profile.goals_long_term}`);
    if (profile.immediate_challenge) lines.push(`Current challenge: ${profile.immediate_challenge}`);
  }
  
  // Skills demonstrated
  const skills = new Set<string>();
  workOutputs.forEach(output => {
    if (Array.isArray(output.skill_tags_used)) {
      output.skill_tags_used.forEach(skill => skills.add(skill));
    }
  });
  if (skills.size > 0) {
    lines.push(`Skills demonstrated: ${Array.from(skills).slice(0, 10).join(', ')}`);
  }
  
  return lines.join('\n');
}

// Generate AI-powered recommendations for NEW topics
async function generateAIRecommendations(
  userContext: string,
  learnedTopics: string[]
): Promise<PredictiveRecommendation[]> {
  try {
    const aiClient = createAIClient();
    
    const systemPrompt = `You are an expert learning advisor for LearnFlow. Your job is to suggest NEW learning topics that the user hasn't explored yet, but would find valuable based on their learning history and goals.

Generate exactly 8 specific, actionable learning topic recommendations. These should be:
- NEW topics they haven't learned yet (exclude topics they've already completed)
- Relevant to their interests, goals, and learning patterns
- Specific enough to be actionable project titles (2-5 words)
- Varied in scope and difficulty
- Progressive (some building on what they know, others exploring adjacent areas)
- Creative and novel - not just variations of what they've already done

For each recommendation, provide:
- topic: A specific, actionable topic name (2-5 words, title case)
- reason: A personalized reason why this topic would be valuable for them (1 sentence)
- priority: "high", "medium", or "low" based on relevance
- confidence: A number 50-95 representing how confident you are this is a good fit

Respond ONLY with valid JSON in this exact format:
{
  "recommendations": [
    {
      "topic": "Topic Name",
      "reason": "Why this is valuable for them",
      "priority": "high",
      "confidence": 85
    }
  ]
}`;

    const excludeList = learnedTopics.length > 0 
      ? `\n\nTopics they've ALREADY learned (DO NOT suggest these): ${learnedTopics.slice(0, 20).join(', ')}`
      : '';

    const userPrompt = `Based on this user's learning profile, suggest 8 NEW learning topics they haven't explored yet:

${userContext}${excludeList}

IMPORTANT: 
- Do NOT suggest topics they've already completed (see exclude list above)
- Suggest NEW, fresh ideas that expand their knowledge in new directions
- Make topics specific and actionable (not generic like "Development" or "Programming")
- Consider their goals, role, and interests to personalize suggestions
- Vary difficulty levels and domains
- Be creative - suggest adjacent fields, advanced applications, or complementary skills

Return exactly 8 recommendations as JSON.`;

    const response = await aiClient.chat({
      functionType: 'topic-recommendations',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      responseFormat: 'json_object',
      maxTokens: 1500,
      temperature: 0.8, // Higher creativity for new ideas
    });

    const content = response.content;
    const parsed = JSON.parse(content);
    
    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations
        .map((r: any) => ({
          topic: String(r.topic || '').trim(),
          reason: String(r.reason || '').trim(),
          priority: (r.priority === 'high' || r.priority === 'medium' || r.priority === 'low') 
            ? r.priority 
            : 'medium',
          confidence: Math.min(95, Math.max(50, parseInt(r.confidence) || 70)),
          signals: ['ai_generated'],
        }))
        .filter((r: PredictiveRecommendation) => r.topic && r.reason && isValidTopic(r.topic))
        .slice(0, 8);
    }
    
    return [];
  } catch (error) {
    console.error('AI recommendation generation failed:', error);
    return []; // Return empty array, fallback to data-driven recommendations
  }
}

function buildRecommendations({
  promptLogs,
  progressTracking,
  learningPaths,
  workOutputs,
  profile,
  behaviorLogs,
}: {
  promptLogs: any[];
  progressTracking: any[];
  learningPaths: any[];
  workOutputs: any[];
  profile: any;
  behaviorLogs: any[];
}): PredictiveRecommendation[] {
  const promptTopics = extractPromptSignals(promptLogs);
  const strugglingConcepts = extractStrugglingConcepts(progressTracking, learningPaths);
  const skillGaps = extractSkillGaps(learningPaths, workOutputs);
  const searchTopics = extractSearchSignals(behaviorLogs);
  const complementaryTopics = extractComplementaryTopics(learningPaths);
  const goals = [
    profile?.goals_short_term,
    profile?.goals_long_term,
    profile?.immediate_challenge,
  ].filter(Boolean) as string[];

  const recommendations: PredictiveRecommendation[] = [];
  const seenTopics = new Set<string>();

  // High priority: Prompt-based topics (up to 3)
  promptTopics
    .filter((entry) => isValidTopic(entry.topic))
    .slice(0, 3)
    .forEach((entry) => {
      const cleanTopic = entry.topic.toLowerCase();
      if (seenTopics.has(cleanTopic)) return;
      seenTopics.add(cleanTopic);
      recommendations.push({
        topic: capitalize(entry.topic),
        reason: `You recently asked ${entry.count} question${entry.count > 1 ? 's' : ''} about this topic.`,
        priority: 'high',
        confidence: Math.min(90, 60 + entry.count * 5),
        signals: ['prompt_logs'],
      });
    });

  // High priority: Struggling concepts (up to 2)
  strugglingConcepts
    .filter((concept) => concept.topic && isValidTopic(concept.topic))
    .slice(0, 2)
    .forEach((concept) => {
      const cleanTopic = concept.topic.toLowerCase();
      if (seenTopics.has(cleanTopic)) return;
      seenTopics.add(cleanTopic);
      recommendations.push({
        topic: concept.topic,
        reason: `Recent practice shows you'd benefit from reinforcing this concept.`,
        priority: 'high',
        confidence: 75,
        signals: ['progress_tracking'],
      });
    });

  // Medium priority: Search queries (up to 2)
  searchTopics
    .filter((entry) => isValidTopic(entry.topic))
    .slice(0, 2)
    .forEach((entry) => {
      const cleanTopic = entry.topic.toLowerCase();
      if (seenTopics.has(cleanTopic)) return;
      seenTopics.add(cleanTopic);
      recommendations.push({
        topic: capitalize(entry.topic),
        reason: `You've been searching for ${entry.topic} - let's dive deeper!`,
        priority: 'medium',
        confidence: 70,
        signals: ['behavior_logs'],
      });
    });

  // Medium priority: Skill gaps (up to 3)
  skillGaps
    .filter((skill) => isValidTopic(skill))
    .slice(0, 3)
    .forEach((skill) => {
      const cleanSkill = skill.toLowerCase();
      if (seenTopics.has(cleanSkill)) return;
      seenTopics.add(cleanSkill);
      recommendations.push({
        topic: capitalize(skill),
        reason: `You've learned the theory - now build a project to master it.`,
        priority: 'medium',
        confidence: 65,
        signals: ['skill_gaps'],
      });
    });

  // Medium priority: Complementary topics (up to 2)
  complementaryTopics
    .filter((topic) => isValidTopic(topic))
    .slice(0, 2)
    .forEach((topic) => {
      const cleanTopic = topic.toLowerCase();
      if (seenTopics.has(cleanTopic)) return;
      seenTopics.add(cleanTopic);
      recommendations.push({
        topic: capitalize(topic),
        reason: `This complements what you've been learning.`,
        priority: 'medium',
        confidence: 60,
        signals: ['complementary'],
      });
    });

  // Medium priority: Goals (up to 2) - extract meaningful topics from goals
  goals.slice(0, 2).forEach((goal) => {
    // Try to extract a topic from the goal text
    let extractedTopic = inferTopic(goal, goal);
    if (!extractedTopic || !isValidTopic(extractedTopic)) {
      // If goal itself isn't a valid topic, try to find keywords
      const goalLower = goal.toLowerCase();
      const keywordMap: Record<string, string> = {
        'dashboard': 'Dashboard Development',
        'automation': 'Process Automation',
        'api': 'API Development',
        'data': 'Data Analysis',
        'machine learning': 'Machine Learning',
        'ai': 'Artificial Intelligence',
        'web': 'Web Development',
        'mobile': 'Mobile App Development',
        'database': 'Database Design',
      };
      
      let foundTopic = null;
      for (const [keyword, topic] of Object.entries(keywordMap)) {
        if (goalLower.includes(keyword)) {
          foundTopic = topic;
          break;
        }
      }
      
      if (!foundTopic || !isValidTopic(foundTopic)) return;
      extractedTopic = foundTopic;
    }
    
    const cleanGoal = extractedTopic.toLowerCase();
    if (seenTopics.has(cleanGoal)) return;
    seenTopics.add(cleanGoal);
    recommendations.push({
      topic: capitalize(extractedTopic),
      reason: `This aligns with your stated goal: "${goal.substring(0, 50)}${goal.length > 50 ? '...' : ''}"`,
      priority: 'medium',
      confidence: 55,
      signals: ['user_profile'],
    });
  });

  // Fill to exactly 8 with high-quality fallback recommendations if needed
  const fallbackTopics = [
    'JavaScript Fundamentals',
    'React Development',
    'Python Programming',
    'API Development',
    'Database Design',
    'Web Development',
    'Data Analysis',
    'Machine Learning',
    'TypeScript Development',
    'Node.js Development',
    'Full-Stack Development',
    'Cloud Architecture',
  ];

  // Ensure we have exactly 8 recommendations
  while (recommendations.length < 8) {
    const fallback = fallbackTopics.find(t => {
      const normalized = t.toLowerCase();
      return !seenTopics.has(normalized) && isValidTopic(t);
    });
    if (!fallback) break; // No more valid fallbacks
    seenTopics.add(fallback.toLowerCase());
    recommendations.push({
      topic: fallback,
      reason: 'A popular topic that might interest you.',
      priority: 'low',
      confidence: 40,
      signals: ['fallback'],
    });
  }

  // Sort by priority and confidence, then ensure exactly 8
  const sorted = recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    })
    .filter((rec) => isValidTopic(rec.topic)); // Final validation pass

  // If we still don't have 8, fill with more fallbacks
  while (sorted.length < 8 && sorted.length < fallbackTopics.length) {
    const fallback = fallbackTopics.find(t => {
      const normalized = t.toLowerCase();
      return !sorted.some(r => r.topic.toLowerCase() === normalized);
    });
    if (fallback) {
      sorted.push({
        topic: fallback,
        reason: 'A popular topic that might interest you.',
        priority: 'low',
        confidence: 40,
        signals: ['fallback'],
      });
    } else {
      break;
    }
  }

  return sorted.slice(0, 8); // Always return exactly 8
}

function extractPromptSignals(promptLogs: any[]) {
  const topicCounts: Record<string, number> = {};
  promptLogs
    .filter((prompt) => !prompt.path_id)
    .forEach((prompt) => {
      const topic = inferTopic(prompt.prompt_text || '', prompt.category);
      if (topic && isValidTopic(topic)) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });

  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .filter(({ topic }) => isValidTopic(topic))
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
    .filter((path) => path.is_completed && path.topic)
    .forEach((path) => {
      // Use the full topic as a skill
      if (path.topic && isValidTopic(path.topic)) {
        learnedSkills.add(path.topic.toLowerCase());
      }
      // Also extract meaningful tags
      if (Array.isArray(path.tags)) {
        path.tags.forEach((tag: string) => {
          if (isValidTopic(tag)) {
            learnedSkills.add(tag.toLowerCase());
          }
        });
      }
    });

  const demonstratedSkills = new Set<string>();
  workOutputs.forEach((output) => {
    if (Array.isArray(output.skill_tags_used)) {
      output.skill_tags_used.forEach((skill: string) => {
        if (isValidTopic(skill)) {
          demonstratedSkills.add(skill.toLowerCase());
        }
      });
    }
  });

  // Return full topic names, not just words
  return Array.from(learnedSkills)
    .filter((skill) => !demonstratedSkills.has(skill))
    .map(skill => capitalize(skill))
    .filter(isValidTopic);
}

// Invalid topic words that should be filtered out
const INVALID_TOPIC_WORDS = new Set([
  'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'should', 'would',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'this', 'that', 'these', 'those',
  'it', 'its', 'they', 'them', 'their', 'there', 'here', 'where', 'general', 'thing', 'stuff',
  'development', 'hooks', 'concept', 'topic', 'subject', 'area', 'field', 'domain'
]);

// Validate if a topic is meaningful and specific
function isValidTopic(topic: string): boolean {
  if (!topic || topic.trim().length === 0) return false;
  
  const normalized = topic.toLowerCase().trim();
  
  // Reject single words (unless they're well-known tech terms)
  const words = normalized.split(/\s+/);
  if (words.length === 1) {
    // Allow single-word tech terms
    const validSingleWords = new Set([
      'python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'django', 
      'flask', 'express', 'next', 'nuxt', 'svelte', 'sql', 'mongodb', 'postgresql', 'redis',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'graphql', 'rest'
    ]);
    return validSingleWords.has(normalized);
  }
  
  // Reject if it's just an invalid word
  if (INVALID_TOPIC_WORDS.has(normalized)) return false;
  
  // Reject if it starts with invalid words
  if (INVALID_TOPIC_WORDS.has(words[0])) return false;
  
  // Must be at least 2 words or a meaningful single tech term
  if (words.length < 2 && words[0].length < 4) return false;
  
  // Reject generic phrases
  const genericPhrases = ['learn about', 'understand', 'get started', 'introduction to'];
  if (genericPhrases.some(phrase => normalized.includes(phrase))) {
    // Only reject if it's JUST the generic phrase
    return words.length > 2;
  }
  
  return true;
}

// Extract more specific topics from prompt text
function inferTopic(promptText: string, fallbackCategory?: string): string | null {
  const text = promptText.toLowerCase();
  
  // Enhanced keyword mapping with more specific topics
  const keywordMap: Record<string, string> = {
    'python': 'Python Programming',
    'javascript': 'JavaScript Development',
    'react': 'React Development',
    'typescript': 'TypeScript Development',
    'api': 'API Development',
    'dashboard': 'Dashboard Development',
    'automation': 'Process Automation',
    'data': 'Data Analysis',
    'sql': 'SQL Database Design',
    'machine learning': 'Machine Learning',
    'ai': 'Artificial Intelligence',
    'artificial intelligence': 'Artificial Intelligence',
    'database': 'Database Design',
    'node': 'Node.js Development',
    'next': 'Next.js Development',
    'django': 'Django Web Development',
    'flask': 'Flask Web Development',
    'vue': 'Vue.js Development',
    'angular': 'Angular Development',
    'express': 'Express.js Development',
    'graphql': 'GraphQL API Design',
    'rest': 'REST API Design',
    'docker': 'Docker Containerization',
    'kubernetes': 'Kubernetes Orchestration',
    'aws': 'AWS Cloud Services',
    'azure': 'Azure Cloud Services',
    'terraform': 'Infrastructure as Code',
    'mongodb': 'MongoDB Database',
    'postgresql': 'PostgreSQL Database',
  };

  // Check for specific keywords first
  for (const [keyword, topic] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) {
      return topic;
    }
  }

  // Try to extract a meaningful phrase from the prompt
  // Look for patterns like "learn X", "build X", "create X", "understand X"
  const patterns = [
    /(?:learn|build|create|develop|understand|master|explore)\s+([a-z]+(?:\s+[a-z]+){1,4})/i,
    /(?:how to|guide to|tutorial on|introduction to)\s+([a-z]+(?:\s+[a-z]+){1,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (isValidTopic(extracted)) {
        return capitalize(extracted);
      }
    }
  }

  // Use fallback category if valid
  if (fallbackCategory && isValidTopic(fallbackCategory)) {
    return capitalize(fallbackCategory);
  }

  return null; // Return null instead of 'general' to filter out
}

function extractSearchSignals(behaviorLogs: any[]) {
  const topicCounts: Record<string, number> = {};
  behaviorLogs.forEach((log) => {
    const query = log.metadata?.query || '';
    if (query) {
      const topic = inferTopic(query);
      if (topic && isValidTopic(topic)) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
  });

  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .filter(({ topic }) => isValidTopic(topic))
    .sort((a, b) => b.count - a.count);
}

function extractComplementaryTopics(learningPaths: any[]) {
  const completedTopics = learningPaths
    .filter((path) => path.is_completed)
    .map((path) => path.topic?.toLowerCase())
    .filter(Boolean);

  const topicMap: Record<string, string[]> = {
    javascript: ['TypeScript', 'Node.js', 'React', 'Next.js'],
    typescript: ['Advanced TypeScript', 'React with TypeScript', 'Type-Safe APIs'],
    react: ['Next.js', 'React Query', 'State Management', 'Testing'],
    python: ['Django', 'FastAPI', 'Data Science', 'Machine Learning'],
    'machine learning': ['Deep Learning', 'Neural Networks', 'Data Science'],
    'system design': ['Microservices', 'Database Design', 'Cloud Architecture'],
    api: ['GraphQL', 'REST Best Practices', 'API Security'],
    sql: ['Database Design', 'Query Optimization', 'Data Modeling'],
  };

  const complementary: string[] = [];
  completedTopics.forEach((topic) => {
    const related = topicMap[topic] || [];
    complementary.push(...related);
  });

  // Remove duplicates and topics already learned
  const learnedTopics = new Set(learningPaths.map((p) => p.topic?.toLowerCase()).filter(Boolean));
  return [...new Set(complementary)]
    .filter((t) => !learnedTopics.has(t.toLowerCase()))
    .slice(0, 5);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

