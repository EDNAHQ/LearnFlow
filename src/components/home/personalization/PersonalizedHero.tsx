import React, { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { useProjects } from '@/hooks/projects/useProjects';
import { useAuth } from '@/hooks/auth';
import { ArrowRight, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const PersonalizedHero = ({ onStartLearning }: { onStartLearning: () => void }) => {
  const { profile, isLoading } = useUserLearningProfile();
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();

  const personalizedData = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Welcome back!";
    if (hour < 12) timeGreeting = "Good morning!";
    else if (hour < 17) timeGreeting = "Good afternoon!";
    else timeGreeting = "Good evening!";

    if (!profile) {
      return {
        greeting: timeGreeting,
        mainInsight: "Your personalized learning journey starts here",
        subtext: "Tell us what you want to learn, and we'll create a custom path that adapts to your pace, style, and goals. Every session builds your unique learning profile.",
        stats: [
          {
            label: 'Ready to Start',
            value: 'Any Topic',
            insight: 'Learn anything you want',
          },
          {
            label: 'Your Pace',
            value: 'You Control',
            insight: 'No deadlines, no pressure',
          },
          {
            label: 'Format',
            value: 'Your Choice',
            insight: 'Text, audio, or visual',
          },
        ],
        activeProjects: [],
        nextAction: "Start your first learning path",
        achievements: [],
        hasData: false,
      };
    }

    const totalHours = Math.floor(profile.totalLearningTimeMinutes / 60);
    const totalDays = Math.floor(profile.totalLearningTimeMinutes / (60 * 24));
    
    const velocity = profile.learningVelocity || 'normal';
    const format = profile.prefersAudio ? 'audio' : 
                   profile.prefersVisual ? 'visual' : 'text';
    
    const velocityText = velocity === 'fast' ? 'fast-paced' : 
                        velocity === 'deliberate' ? 'deliberate' : 'steady';
    
    const mainInsight = `You're a ${velocityText} ${format} learner who thrives on ${profile.optimalSessionLength || 30}-minute sessions`;

    const successRate = Math.round(profile.avgSuccessRate || 75);
    const subtext = successRate >= 85 
      ? `Your ${successRate}% success rate shows you're mastering concepts effectively. Keep pushing forward.`
      : successRate >= 75
      ? `Your ${successRate}% success rate indicates strong comprehension. You're on the right track.`
      : `Every session builds your knowledge. Your ${successRate}% success rate shows steady progress.`;

    const stats = [
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        color: 'text-brand-gold',
        bgColor: 'bg-brand-gold/10',
        insight: successRate >= 85 ? 'Exceptional!' : 
                successRate >= 75 ? 'Strong' : 'Improving',
      },
      {
        label: 'Learning Streak',
        value: profile.currentStreakDays > 0 ? `${profile.currentStreakDays} days` : 'Start one!',
        color: 'text-brand-pink',
        bgColor: 'bg-brand-pink/10',
        insight: profile.currentStreakDays >= 7 ? 'On fire!' :
                profile.currentStreakDays >= 3 ? 'Building momentum' : 'Begin your streak',
      },
      {
        label: 'Total Learning',
        value: totalHours >= 24 ? `${totalDays} day${totalDays !== 1 ? 's' : ''}` :
               totalHours >= 1 ? `${totalHours} hour${totalHours !== 1 ? 's' : ''}` : '<1 hour',
        color: 'text-brand-purple',
        bgColor: 'bg-brand-purple/10',
        insight: totalHours >= 24 ? 'Impressive journey!' :
                totalHours >= 1 ? 'Great start!' : 'Just beginning',
      },
    ];

    const activeProjects = projects
      .filter(p => !p.is_completed && (p.progress || 0) > 0)
      .slice(0, 2);

    let nextAction = "Start a new learning path";
    if (activeProjects.length > 0) {
      const mostRecent = activeProjects[0];
      nextAction = `Continue "${mostRecent.topic}"`;
    }

    const achievements = [];
    if (profile.avgSuccessRate >= 85) {
      achievements.push({
        text: `Exceptional ${successRate}% success rate`,
        color: 'text-brand-gold',
      });
    }
    if (profile.currentStreakDays >= 7) {
      achievements.push({
        text: `${profile.currentStreakDays}-day learning streak`,
        color: 'text-brand-pink',
      });
    }
    if (profile.learningVelocity === 'fast' && profile.avgSuccessRate >= 80) {
      achievements.push({
        text: 'Top 20% of fast learners',
        color: 'text-brand-purple',
      });
    }
    if (totalHours >= 24) {
      achievements.push({
        text: `${totalDays} day${totalDays !== 1 ? 's' : ''} of learning`,
        color: 'text-brand-purple',
      });
    }

    return {
      greeting: timeGreeting,
      mainInsight,
      subtext,
      stats,
      activeProjects,
      nextAction,
      achievements: achievements.slice(0, 2),
      hasData: true,
    };
  }, [profile, projects]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop || !videoRef.current) return;
    
    const video = videoRef.current;
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error('Video play error:', error);
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', playVideo);
      return () => video.removeEventListener('loadeddata', playVideo);
    }
  }, [isDesktop]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const handleContinueProject = (projectId: string) => {
    navigate(`/content/${projectId}`);
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image - ALWAYS visible */}
      <img
        src="/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_1.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Background Video - Only on desktop */}
      {isDesktop && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-[1]"
          poster="/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_1.png"
        >
          <source
            src="/videos/social_sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_68369123-6a21-4b9e-8697-722a42766ab7_0.mp4"
            type="video/mp4"
          />
        </video>
      )}

      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-[2]" />
      <div className="absolute inset-0 brand-gradient opacity-30 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-transparent to-brand-pink/20 z-[2]" />

      {/* Content Container */}
      <div className="relative z-[3] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Compact Header Row: Greeting + Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <span className="text-xs font-medium text-white/90">Personalized for You</span>
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                {personalizedData.greeting}
              </h1>
            </div>
            
            {/* Compact Stats - Horizontal */}
            {personalizedData.stats.length > 0 && (
              <div className="flex gap-3 sm:gap-4">
                {personalizedData.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + (index * 0.05) }}
                    whileHover={{ scale: 1.05 }}
                    className="relative backdrop-blur-xl bg-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 shadow-lg min-w-[80px] sm:min-w-[100px]"
                  >
                    <div className="text-xs text-white/70 uppercase tracking-wider mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/60">
                      {stat.insight}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Insight Card - More Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mb-6 sm:mb-8"
        >
          <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-brand-purple/30 via-brand-pink/30 to-brand-gold/30 opacity-50 blur-xl" />
            <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-xl" />
            
            <div className="relative z-10">
              {personalizedData.hasData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-brand-gold uppercase tracking-wider bg-brand-gold/10 px-3 py-1.5 rounded-full border border-brand-gold/20">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Your Learning Profile
                  </span>
                </motion.div>
              )}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight"
              >
                {personalizedData.mainInsight}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-base sm:text-lg text-white/90 font-light leading-relaxed"
              >
                {personalizedData.subtext}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Row: Active Projects + Achievements + CTA */}
        <div className="space-y-4 sm:space-y-6">
          {/* Active Projects - Compact */}
          {personalizedData.activeProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-brand-gold" />
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Continue Learning
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalizedData.activeProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (index * 0.1) }}
                    whileHover={{ scale: 1.02 }}
                    className="relative backdrop-blur-xl bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 shadow-lg cursor-pointer group overflow-hidden"
                    onClick={() => handleContinueProject(project.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <h4 className="text-base sm:text-lg font-semibold text-white mb-3 group-hover:text-brand-gold transition-colors line-clamp-2">
                        {project.topic}
                      </h4>
                      <div className="w-full bg-black/30 rounded-full h-2 mb-2 overflow-hidden backdrop-blur-sm">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress || 0}%` }}
                          transition={{ delay: 0.9 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
                          className="bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold h-2 rounded-full"
                        />
                      </div>
                      <div className="text-sm font-medium text-white/90">
                        {project.progress || 0}% complete
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Achievements + CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {/* Achievements - Compact */}
            {personalizedData.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
                {personalizedData.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + (index * 0.05) }}
                    whileHover={{ scale: 1.05 }}
                    className="relative px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-md overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/30 via-brand-pink/30 to-brand-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 text-sm font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {achievement.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA - Compact */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onStartLearning}
                size="lg"
                className="group relative px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold text-white rounded-full transform transition-all duration-200 shadow-xl brand-gradient hover:opacity-90 overflow-hidden whitespace-nowrap"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {personalizedData.nextAction}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced floating orbs for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-gold/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </section>
  );
};


