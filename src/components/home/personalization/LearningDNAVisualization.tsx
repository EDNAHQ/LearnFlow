import React, { useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { useProjects } from '@/hooks/projects/useProjects';
import { Zap, Headphones, Eye, BookOpen, TrendingUp, Clock, Target, Briefcase, Award, Lightbulb, Code } from 'lucide-react';

interface DNANode {
  id: string;
  label: string;
  displayValue: string;
  insight?: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  position: number;
}

const DEFAULT_PROFILE = {
  learningVelocity: 'normal' as const,
  optimalSessionLength: 30,
  avgSuccessRate: 75,
  prefersAudio: false,
  prefersVisual: false,
  prefersText: true,
  preferredDifficulty: 3,
  totalLearningTimeMinutes: 0,
  currentStreakDays: 0,
  hintUsageRate: 0.2,
  skipRate: 0.1,
  mostEngagedTopics: [] as string[],
  leastEngagedTopics: [] as string[],
};

export const LearningDNAVisualization = () => {
  const { profile, isLoading } = useUserLearningProfile();
  const { profile: userProfile, loading: profileLoading } = useUserProfile();
  const { projects, loading: projectsLoading } = useProjects();
  
  const normalizedProfile = useMemo(() => {
    if (!profile) return DEFAULT_PROFILE;
    
    return {
      learningVelocity: profile.learningVelocity || 'normal',
      optimalSessionLength: profile.optimalSessionLength || 30,
      avgSuccessRate: profile.avgSuccessRate || 75,
      prefersAudio: profile.prefersAudio ?? false,
      prefersVisual: profile.prefersVisual ?? false,
      prefersText: profile.prefersText ?? true,
      preferredDifficulty: profile.preferredDifficulty || 3,
      totalLearningTimeMinutes: profile.totalLearningTimeMinutes || 0,
      currentStreakDays: profile.currentStreakDays || 0,
      hintUsageRate: profile.hintUsageRate ?? 0.2,
      skipRate: profile.skipRate ?? 0.1,
      mostEngagedTopics: profile.mostEngagedTopics || [],
      leastEngagedTopics: profile.leastEngagedTopics || [],
    };
  }, [profile]);

  const personalizationData = useMemo(() => {
    const completedProjects = projects.filter(p => p.is_completed);
    const inProgressProjects = projects.filter(p => !p.is_completed && (p.progress || 0) > 0);
    const totalProjects = projects.length;
    const completionRate = totalProjects > 0 ? (completedProjects.length / totalProjects) * 100 : 0;
    
    const topSkills = [];
    if (userProfile?.skill_data) topSkills.push({ name: 'Data', level: userProfile.skill_data });
    if (userProfile?.skill_apps) topSkills.push({ name: 'Apps', level: userProfile.skill_apps });
    if (userProfile?.skill_automation) topSkills.push({ name: 'Automation', level: userProfile.skill_automation });
    if (userProfile?.skill_ai_reasoning) topSkills.push({ name: 'AI Reasoning', level: userProfile.skill_ai_reasoning });
    topSkills.sort((a, b) => b.level - a.level);
    
    const recentTopics = projects.slice(0, 5).map(p => p.topic);
    
    return {
      role: userProfile?.role,
      industry: userProfile?.industry,
      experienceLevel: userProfile?.experience_level,
      totalProjects,
      completedProjects: completedProjects.length,
      inProgressProjects: inProgressProjects.length,
      completionRate,
      topSkills: topSkills.slice(0, 2),
      recentTopics,
      goalsShortTerm: userProfile?.goals_short_term,
      goalsLongTerm: userProfile?.goals_long_term,
      immediateChallenge: userProfile?.immediate_challenge,
      currentTools: userProfile?.current_tools || [],
    };
  }, [projects, userProfile]);

  const nodes: DNANode[] = useMemo(() => {
    const velocityValue = normalizedProfile.learningVelocity === 'fast' ? 0.9 : 
                         normalizedProfile.learningVelocity === 'deliberate' ? 0.3 : 0.6;
    
    const sessionValue = Math.min(normalizedProfile.optimalSessionLength / 60, 1);
    const successValue = normalizedProfile.avgSuccessRate / 100;
    const difficultyValue = normalizedProfile.preferredDifficulty / 5;
    
    const formatValue = normalizedProfile.prefersAudio ? 0.8 : 
                       normalizedProfile.prefersVisual ? 0.6 : 0.4;
    
    const streakValue = Math.min(normalizedProfile.currentStreakDays / 30, 1);
    
    const velocityLabel = normalizedProfile.learningVelocity === 'fast' ? 'Fast' : 
                         normalizedProfile.learningVelocity === 'deliberate' ? 'Deliberate' : 'Steady';
    const velocityInsight = normalizedProfile.learningVelocity === 'fast' ? 'Top 15%' : 
                          normalizedProfile.learningVelocity === 'deliberate' ? 'Deep focus' : 'Balanced';
    
    const sessionInsight = normalizedProfile.optimalSessionLength >= 45 ? 'Long sessions' :
                          normalizedProfile.optimalSessionLength >= 30 ? 'Optimal' : 'Quick bursts';
    
    const successInsight = normalizedProfile.avgSuccessRate >= 85 ? 'Excellent' :
                          normalizedProfile.avgSuccessRate >= 75 ? 'Strong' : 'Improving';
    
    const formatLabel = normalizedProfile.prefersAudio ? 'Audio' :
                       normalizedProfile.prefersVisual ? 'Visual' : 'Text';
    
    const difficultyLabel = normalizedProfile.preferredDifficulty >= 4 ? 'Advanced' :
                           normalizedProfile.preferredDifficulty >= 3 ? 'Intermediate' : 'Beginner';

    const baseNodes: DNANode[] = [
      {
        id: 'velocity',
        label: 'Learning Speed',
        displayValue: velocityLabel,
        insight: velocityInsight,
        value: velocityValue,
        color: '#6654f5',
        icon: Zap,
        position: 0.15,
      },
      {
        id: 'session',
        label: 'Session Length',
        displayValue: `${normalizedProfile.optimalSessionLength}min`,
        insight: sessionInsight,
        value: sessionValue,
        color: '#ca5a8b',
        icon: Clock,
        position: 0.3,
      },
      {
        id: 'success',
        label: 'Success Rate',
        displayValue: `${Math.round(normalizedProfile.avgSuccessRate)}%`,
        insight: successInsight,
        value: successValue,
        color: '#f2b347',
        icon: TrendingUp,
        position: 0.45,
      },
      {
        id: 'format',
        label: 'Format',
        displayValue: formatLabel,
        insight: 'Preferred',
        value: formatValue,
        color: '#6654f5',
        icon: normalizedProfile.prefersAudio ? Headphones : 
              normalizedProfile.prefersVisual ? Eye : BookOpen,
        position: 0.6,
      },
      {
        id: 'difficulty',
        label: 'Difficulty',
        displayValue: difficultyLabel,
        insight: 'Sweet spot',
        value: difficultyValue,
        color: '#ca5a8b',
        icon: Target,
        position: 0.75,
      },
      {
        id: 'streak',
        label: 'Streak',
        displayValue: normalizedProfile.currentStreakDays > 0 ? `${normalizedProfile.currentStreakDays}d` : 'Start one!',
        insight: normalizedProfile.currentStreakDays >= 7 ? 'On fire!' :
                normalizedProfile.currentStreakDays >= 3 ? 'Building' : 'Begin',
        value: streakValue,
        color: '#f2b347',
        icon: Zap,
        position: 0.9,
      },
    ];

    const personalizationNodes: DNANode[] = [];

    if (personalizationData.totalProjects > 0) {
      const projectValue = Math.min(personalizationData.completionRate / 100, 1);
      const projectLabel = personalizationData.completedProjects > 0 
        ? `${personalizationData.completedProjects} done`
        : `${personalizationData.inProgressProjects} active`;
      const projectInsight = personalizationData.completionRate >= 75 ? 'High completion' :
                            personalizationData.completionRate >= 50 ? 'Steady progress' : 'Building momentum';
      
      personalizationNodes.push({
        id: 'projects',
        label: 'Projects',
        displayValue: projectLabel,
        insight: projectInsight,
        value: projectValue,
        color: '#6654f5',
        icon: Briefcase,
        position: 0.05,
      });
    }

    if (personalizationData.topSkills.length > 0) {
      const topSkill = personalizationData.topSkills[0];
      const skillValue = topSkill.level / 5;
      const skillLabel = topSkill.name;
      const skillInsight = topSkill.level >= 4 ? 'Expert level' :
                          topSkill.level >= 3 ? 'Strong' : 'Developing';
      
      personalizationNodes.push({
        id: 'topSkill',
        label: 'Top Skill',
        displayValue: skillLabel,
        insight: skillInsight,
        value: skillValue,
        color: '#ca5a8b',
        icon: Award,
        position: 0.95,
      });
    }

    if (normalizedProfile.mostEngagedTopics.length > 0) {
      const topicValue = Math.min(normalizedProfile.mostEngagedTopics.length / 5, 1);
      const topicLabel = normalizedProfile.mostEngagedTopics[0].substring(0, 8);
      const topicInsight = normalizedProfile.mostEngagedTopics.length >= 3 ? 'Diverse interests' : 'Focused';
      
      personalizationNodes.push({
        id: 'topics',
        label: 'Top Topic',
        displayValue: topicLabel,
        insight: topicInsight,
        value: topicValue,
        color: '#f2b347',
        icon: Lightbulb,
        position: 0.85,
      });
    }

    if (personalizationData.role) {
      const roleValue = 0.7;
      const roleLabel = personalizationData.role.substring(0, 10);
      
      personalizationNodes.push({
        id: 'role',
        label: 'Role',
        displayValue: roleLabel,
        insight: personalizationData.industry || 'Professional',
        value: roleValue,
        color: '#6654f5',
        icon: Code,
        position: 0.1,
      });
    }

    return [...personalizationNodes, ...baseNodes].sort((a, b) => a.position - b.position);
  }, [normalizedProfile, personalizationData]);

  const pathLength = useMotionValue(0);
  const pathLengthSpring = useSpring(pathLength, { stiffness: 100, damping: 30 });

  React.useEffect(() => {
    pathLength.set(1);
  }, [pathLength]);

  const isLoadingData = isLoading || profileLoading || projectsLoading;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const helixHeight = 500;
  const helixWidth = 500;
  const centerX = helixWidth / 2;
  const centerY = helixHeight / 2;
  const radius = 110;
  const turns = 1.8;

  const createHelixPath = (offset: number, reverse = false) => {
    const points: string[] = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = (reverse ? -1 : 1) * t * turns * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius + offset);
      const y = centerY + (t * helixHeight) - (helixHeight / 2);
      points.push(`${x},${y}`);
    }
    
    return `M ${points.join(' L ')}`;
  };

  const leftPath = createHelixPath(-20);
  const rightPath = createHelixPath(20, true);

  const getNodePosition = (position: number, nodeValue: number) => {
    const t = position;
    const angle = t * turns * Math.PI * 2;
    const offset = -30 + (nodeValue * 60);
    const x = centerX + Math.cos(angle) * (radius + offset);
    const y = centerY + (t * helixHeight) - (helixHeight / 2);
    return { x, y };
  };

  const getInsightText = () => {
    if (!profile) {
      return {
        title: "Discover Your Learning DNA",
        subtitle: "Start learning to unlock personalized insights",
        titleWords: ["Discover", "Your", "Learning", "DNA"],
        wowInsights: [],
      };
    }

    const totalHours = Math.floor(normalizedProfile.totalLearningTimeMinutes / 60);
    const totalDays = Math.floor(normalizedProfile.totalLearningTimeMinutes / (60 * 24));
    const velocity = normalizedProfile.learningVelocity;
    const format = normalizedProfile.prefersAudio ? 'audio' : 
                   normalizedProfile.prefersVisual ? 'visual' : 'text';
    
    const velocityText = velocity === 'fast' ? 'fast-paced' : 
                        velocity === 'deliberate' ? 'deliberate' : 'steady';
    
    let title = `You're a ${velocityText} ${format} learner`;
    const titleWords = title.split(' ');
    
    if (personalizationData.role) {
      title = `${personalizationData.role} • ${velocityText} ${format} learner`;
    }
    
    const wowInsights = [];
    
    if (personalizationData.totalProjects > 0) {
      if (personalizationData.completedProjects > 0) {
        wowInsights.push(`${personalizationData.completedProjects} project${personalizationData.completedProjects !== 1 ? 's' : ''} completed`);
      }
      if (personalizationData.inProgressProjects > 0) {
        wowInsights.push(`${personalizationData.inProgressProjects} project${personalizationData.inProgressProjects !== 1 ? 's' : ''} in progress`);
      }
    }
    
    if (normalizedProfile.totalLearningTimeMinutes > 0) {
      if (totalHours >= 24) {
        wowInsights.push(`${totalDays} day${totalDays !== 1 ? 's' : ''} of learning`);
      } else if (totalHours >= 1) {
        wowInsights.push(`${totalHours} hour${totalHours !== 1 ? 's' : ''} invested`);
      }
    }
    
    if (normalizedProfile.mostEngagedTopics.length > 0) {
      const topTopic = normalizedProfile.mostEngagedTopics[0];
      wowInsights.push(`Most engaged: ${topTopic}`);
    }
    
    if (personalizationData.topSkills.length > 0) {
      const topSkill = personalizationData.topSkills[0];
      wowInsights.push(`Strongest in ${topSkill.name} (${topSkill.level}/5)`);
    }
    
    if (normalizedProfile.avgSuccessRate >= 85) {
      wowInsights.push(`${Math.round(normalizedProfile.avgSuccessRate)}% success rate`);
    }
    
    if (normalizedProfile.currentStreakDays >= 7) {
      wowInsights.push(`${normalizedProfile.currentStreakDays}-day streak 🔥`);
    }
    
    if (personalizationData.goalsShortTerm) {
      wowInsights.push(`Goal: ${personalizationData.goalsShortTerm.substring(0, 40)}${personalizationData.goalsShortTerm.length > 40 ? '...' : ''}`);
    }
    
    let subtitle = `${normalizedProfile.optimalSessionLength}min sessions • ${Math.round(normalizedProfile.avgSuccessRate)}% success rate`;
    
    if (personalizationData.industry) {
      subtitle = `${personalizationData.industry} • ${subtitle}`;
    } else if (personalizationData.experienceLevel) {
      const levelMap: { [key: string]: string } = {
        'beginner': 'Beginner',
        'competent': 'Competent',
        'builder': 'Builder'
      };
      subtitle = `${levelMap[personalizationData.experienceLevel] || personalizationData.experienceLevel} • ${subtitle}`;
    }
    
    return {
      title,
      subtitle,
      titleWords: title.split(' '),
      wowInsights: wowInsights.slice(0, 4),
    };
  };

  const insights = getInsightText();

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] lg:min-h-[650px] flex items-center justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-5xl">
        <svg
          width="100%"
          height={helixHeight}
          viewBox={`0 0 ${helixWidth} ${helixHeight}`}
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          style={{ maxHeight: '500px', minHeight: '450px' }}
        >
          <defs>
            <linearGradient id="helixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6654f5" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ca5a8b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f2b347" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="helixGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f2b347" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ca5a8b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6654f5" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glowStrong">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <motion.path
            d={leftPath}
            fill="none"
            stroke="url(#helixGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pathLengthSpring.get() }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            filter="url(#glow)"
          />
          
          <motion.path
            d={rightPath}
            fill="none"
            stroke="url(#helixGradient2)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pathLengthSpring.get() }}
            transition={{ duration: 2.5, delay: 0.3, ease: "easeOut" }}
            filter="url(#glow)"
          />

          {nodes.map((node, index) => {
            const { x, y } = getNodePosition(node.position, node.value);
            const nodeSize = 28 + (node.value * 18);
            
            return (
              <g key={node.id}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={nodeSize}
                  fill={node.color}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.95 }}
                  transition={{ 
                    delay: 0.5 + (index * 0.15),
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  filter="url(#glow)"
                />
                <motion.circle
                  cx={x}
                  cy={y}
                  r={nodeSize - 5}
                  fill="white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.7 + (index * 0.15),
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                />
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.9 + (index * 0.15),
                  }}
                >
                  <foreignObject
                    x={x - 16}
                    y={y - 16}
                    width={32}
                    height={32}
                  >
                    <div className="flex items-center justify-center w-8 h-8" style={{ color: node.color }}>
                      <node.icon className="w-4 h-4" />
                    </div>
                  </foreignObject>
                </motion.g>
                
                <motion.text
                  x={x}
                  y={y + nodeSize + 20}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="16"
                  fontWeight="700"
                  initial={{ opacity: 0, y: y + nodeSize + 10 }}
                  animate={{ opacity: 1, y: y + nodeSize + 20 }}
                  transition={{ delay: 1.1 + (index * 0.15) }}
                  className="font-bold"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {node.displayValue}
                </motion.text>
                <motion.text
                  x={x}
                  y={y + nodeSize + 38}
                  textAnchor="middle"
                  fill="#0b0c18"
                  fontSize="11"
                  fontWeight="500"
                  initial={{ opacity: 0, y: y + nodeSize + 25 }}
                  animate={{ opacity: 0.7, y: y + nodeSize + 38 }}
                  transition={{ delay: 1.2 + (index * 0.15) }}
                  className="font-medium"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {node.label}
                </motion.text>
                {node.insight && (
                  <motion.text
                    x={x}
                    y={y + nodeSize + 52}
                    textAnchor="middle"
                    fill="#0b0c18"
                    fontSize="10"
                    fontWeight="400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1.3 + (index * 0.15) }}
                    className="font-light italic"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {node.insight}
                  </motion.text>
                )}
              </g>
            );
          })}
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="absolute -bottom-16 sm:-bottom-14 lg:-bottom-12 left-0 right-0 text-center"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 px-4">
            {insights.titleWords && insights.titleWords.length > 2 ? (
              <>
                <span className="text-brand-black">{insights.titleWords.slice(0, -2).join(' ')}</span>{' '}
                <span className="text-gradient">{insights.titleWords.slice(-2).join(' ')}</span>
              </>
            ) : (
              <span className="text-gradient">{insights.title}</span>
            )}
          </h3>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-brand-black/70 font-light px-4 max-w-2xl mx-auto mb-4">
            {insights.subtitle}
          </p>
          {insights.wowInsights && insights.wowInsights.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 px-4 mt-4">
              {insights.wowInsights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2 + (idx * 0.1) }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 border border-brand-purple/20"
                >
                  <span className="text-xs sm:text-sm font-medium text-brand-black/80">
                    {insight}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-80 sm:h-80 bg-brand-purple/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-80 sm:h-80 bg-brand-pink/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-72 sm:h-72 bg-brand-gold/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

