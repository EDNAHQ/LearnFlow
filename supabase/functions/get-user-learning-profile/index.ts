// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/utils.ts';
import { getAuthContext } from '../_shared/auth.ts';

interface UserLearningProfile {
  // Learning velocity & patterns
  avgCompletionTime: number;
  learningVelocity: 'fast' | 'normal' | 'deliberate';
  optimalSessionLength: number; // minutes
  
  // Difficulty preferences
  preferredDifficulty: number; // 1-5
  difficultyGap: number; // user vs system perception
  avgSuccessRate: number;
  
  // Format preferences
  prefersAudio: boolean;
  prefersVisual: boolean;
  prefersText: boolean;
  
  // Engagement patterns
  preferredLearningTimes: string[]; // hours of day
  devicePreference: 'mobile' | 'desktop' | 'tablet' | null;
  
  // Learning style indicators
  hintUsageRate: number;
  skipRate: number;
  exampleUsageRate: number;
  remediationFrequency: number;
  
  // Success patterns
  failureRecoveryRate: number;
  conceptsNeedingRemediation: string[];
  
  // Time-based insights
  totalLearningTimeMinutes: number;
  dailyAverageMinutes: number;
  longestStreakDays: number;
  currentStreakDays: number;
  
  // Content preferences
  mostEngagedTopics: string[];
  leastEngagedTopics: string[];
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
      { data: profile },
      { data: behaviorLogs },
      { data: progressTracking },
      { data: learningSessions },
      { data: learningPaths },
    ] = await Promise.all([
      supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabaseClient
        .from('behavior_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(250),
      supabaseClient
        .from('progress_tracking')
        .select('*')
        .eq('user_id', user.id),
      supabaseClient
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(200),
      supabaseClient
        .from('learning_paths')
        .select('topic,id,created_at,is_completed')
        .eq('user_id', user.id),
    ]);

    const learningProfile = buildLearningProfile(
      profile,
      behaviorLogs || [],
      progressTracking || [],
      learningSessions || [],
      learningPaths || []
    );

    return new Response(
      JSON.stringify({ profile: learningProfile }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-user-learning-profile:', error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message || 'Unexpected error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function arrayAverage(values: number[], fallback = 0) {
  if (!values.length) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ratio(part: number, total: number) {
  if (!total) return 0;
  return part / total;
}

function determineLearningVelocity(avgCompletionTime: number): 'fast' | 'normal' | 'deliberate' {
  if (!avgCompletionTime) return 'normal';
  if (avgCompletionTime < 240) return 'fast';
  if (avgCompletionTime > 600) return 'deliberate';
  return 'normal';
}

function resolvePreferredLearningTimes(hours: number[]) {
  const counts: Record<number, number> = {};
  hours.forEach((hour) => {
    counts[hour] = (counts[hour] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => `${String(hour).padStart(2, '0')}:00`);
}

function resolveDevicePreference(learningSessions: any[]) {
  const counts: Record<string, number> = {};
  learningSessions.forEach((session) => {
    if (session.device_type) {
      counts[session.device_type] = (counts[session.device_type] || 0) + 1;
    }
  });
  const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (top?.[0] as 'mobile' | 'desktop' | 'tablet') ?? null;
}

function mapRemediationTopics(progressTracking: any[], learningPaths: any[]) {
  const remediationIds = new Set(
    progressTracking
      .filter((record) => record.remediation_needed && record.module_id)
      .map((record) => record.module_id)
  );

  const topics = learningPaths
    ?.filter((path) => remediationIds.has(path.id))
    .map((path) => path.topic) ?? [];

  return Array.from(new Set(topics)).slice(0, 5);
}

function buildTopicEngagement(learningSessions: any[], learningPaths: any[]) {
  const sessionCounts: Record<string, number> = {};
  learningSessions.forEach((session) => {
    if (session.path_id) {
      sessionCounts[session.path_id] = (sessionCounts[session.path_id] || 0) + 1;
    }
  });

  const scoredTopics =
    learningPaths?.map((path) => ({
      topic: path.topic,
      score: sessionCounts[path.id] || 0,
    })) ?? [];

  const sorted = scoredTopics.sort((a, b) => b.score - a.score);

  return {
    most: sorted.slice(0, 5).map((entry) => entry.topic),
    least: [...sorted].reverse().slice(0, 3).map((entry) => entry.topic),
  };
}

function buildLearningProfile(
  profile: any,
  behaviorLogs: any[],
  progressTracking: any[],
  learningSessions: any[],
  learningPaths: any[]
): UserLearningProfile {
  const completionTimes = progressTracking
    .map((record) => Number(record.completion_time))
    .filter((value) => Number.isFinite(value));

  const avgCompletionTime = Math.round(arrayAverage(completionTimes, 0));

  const sessionDurations = learningSessions
    .map((session) => Number(session.duration_seconds))
    .filter((value) => Number.isFinite(value));
  const optimalSessionLength = Math.max(Math.round(arrayAverage(sessionDurations, 180) / 60), 5);

  const preferredDifficulty = arrayAverage(
    progressTracking
      .map((record) => Number(record.difficulty_rating))
      .filter((value) => Number.isFinite(value)),
    3
  );
  const avgSystemDifficulty = arrayAverage(
    progressTracking
      .map((record) => Number(record.system_difficulty_rating))
      .filter((value) => Number.isFinite(value)),
    3
  );
  const difficultyGap = preferredDifficulty - avgSystemDifficulty;

  const avgSuccessRate = arrayAverage(
    progressTracking
      .map((record) => Number(record.success_rate))
      .filter((value) => Number.isFinite(value)),
    0
  );

  const totalSessions = learningSessions.length || 1;
  const prefersAudio =
    ratio(learningSessions.filter((session) => session.audio_played).length, totalSessions) >= 0.3;
  const prefersVisual =
    ratio(
      behaviorLogs.filter((log) => log.action_type === 'content_view' && log.metadata?.mental_model_viewed).length,
      totalSessions
    ) >= 0.2;
  const prefersText =
    ratio(
      learningSessions.filter((session) => (session.content_scrolled_percent || 0) > 60).length,
      totalSessions
    ) >= 0.4;

  const sessionHours = learningSessions
    .map((session) => (session.started_at ? new Date(session.started_at).getHours() : null))
    .filter((value) => typeof value === 'number') as number[];

  const totalAttempts = progressTracking.reduce((sum, record) => sum + (record.attempts_count || 1), 0) || 1;
  const hintUsageRate =
    Math.round(
      ratio(progressTracking.reduce((sum, record) => sum + (record.hints_requested || 0), 0), totalAttempts) * 100
    ) / 100;
  const skipRate =
    Math.round(
      ratio(progressTracking.filter((record) => record.skipped).length, progressTracking.length || 1) * 100
    ) / 100;
  const exampleUsageRate =
    Math.round(
      ratio(progressTracking.reduce((sum, record) => sum + (record.examples_viewed || 0), 0), progressTracking.length || 1) *
        100
    ) / 100;
  const remediationFrequency =
    Math.round(
      ratio(progressTracking.filter((record) => record.remediation_needed).length, progressTracking.length || 1) * 100
    ) / 100;
  const failureRecoveryRate =
    Math.round(
      ratio(
        behaviorLogs.filter((log) => log.action_type === 'task_success' && log.metadata?.previous_failure).length,
        behaviorLogs.filter((log) => log.action_type === 'task_failure').length || 1
      ) * 100
    ) / 100;

  const { most: mostEngagedTopics, least: leastEngagedTopics } = buildTopicEngagement(learningSessions, learningPaths);

  return {
    avgCompletionTime,
    learningVelocity: determineLearningVelocity(avgCompletionTime),
    optimalSessionLength,
    preferredDifficulty: Math.round(preferredDifficulty * 10) / 10,
    difficultyGap: Math.round(difficultyGap * 10) / 10,
    avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
    prefersAudio,
    prefersVisual: prefersVisual && !prefersAudio,
    prefersText: prefersText && !prefersAudio && !prefersVisual,
    preferredLearningTimes: resolvePreferredLearningTimes(sessionHours),
    devicePreference: resolveDevicePreference(learningSessions),
    hintUsageRate,
    skipRate,
    exampleUsageRate,
    remediationFrequency,
    failureRecoveryRate,
    conceptsNeedingRemediation: mapRemediationTopics(progressTracking, learningPaths),
    totalLearningTimeMinutes: profile?.total_learning_time_minutes || 0,
    dailyAverageMinutes: profile?.daily_learning_time_minutes || 0,
    longestStreakDays: profile?.longest_streak_days || 0,
    currentStreakDays: profile?.learning_streak_days || 0,
    mostEngagedTopics,
    leastEngagedTopics,
  };
}

