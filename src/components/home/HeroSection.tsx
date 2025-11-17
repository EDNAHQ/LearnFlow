import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { PersonalizedHero } from "@/components/home/personalization/PersonalizedHero";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSectionProps {
  onStartLearning: () => void;
}

export const HeroSection = ({ onStartLearning }: HeroSectionProps) => {
  const { user, loading: authLoading } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Default to mobile (false) to avoid flash on mobile devices
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

  // Show loading skeleton only if auth is still loading and we don't have a cached user
  if (authLoading && !user) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden flex items-center justify-center py-12 sm:py-16 md:py-20 min-h-[600px]">
          <div className="absolute inset-0 bg-black/20 animate-pulse" />
          <div className="relative z-[3] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8">
            <div className="h-16 bg-white/10 rounded-lg w-3/4 mx-auto mb-6 animate-pulse" />
            <div className="h-6 bg-white/10 rounded-lg w-1/2 mx-auto mb-8 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // Use AnimatePresence for smooth transitions between authenticated/unauthenticated states
  return (
    <AnimatePresence mode="wait">
      {!authLoading && user ? (
        <motion.div
          key="personalized"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PersonalizedHero onStartLearning={onStartLearning} />
        </motion.div>
      ) : (
        <motion.div
          key="default"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <section className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden flex items-center justify-center py-12 sm:py-16 md:py-20">
        {/* Background Image - ALWAYS visible */}
        <img
          src="/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_0.png"
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
            poster="/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_0.png"
          >
            <source
              src="/videos/social_sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_902bb92b-8a56-4abb-9593-b4f8fd7cc0fa_0.mp4"
              type="video/mp4"
            />
          </video>
        )}

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 z-[2]" />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-[2]" />

        {/* Additional colored overlay for brand colors */}
        <div className="absolute inset-0 brand-gradient opacity-40 z-[2]" />

        {/* Content Container - Centered */}
        <div className="relative z-[3] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-fade-down leading-tight">
            <span className="block text-white mb-2 sm:mb-3">Master Any Topic with</span>
            <span className="block text-gradient leading-normal">Personalized Learning</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-down animation-delay-400">
            Create custom learning paths that adapt to your pace.
            Transform your knowledge with intelligent, adaptive education.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center mb-10 sm:mb-12 animate-fade-up animation-delay-600">
            <Button
              onClick={onStartLearning}
              size="lg"
              className="group relative px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold text-white rounded-full transform transition-all duration-200 hover:scale-105 shadow-2xl brand-gradient hover:opacity-90"
            >
              <span className="flex items-center gap-2">
                Start Your Journey
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>

          {/* Value props (non-numeric, future-proof) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 animate-fade-up animation-delay-800">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Guided</div>
              <div className="text-sm text-white/70">Clear steps that keep you moving</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Personalized</div>
              <div className="text-sm text-white/70">Learning paths tailored to your goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Flexible</div>
              <div className="text-sm text-white/70">Learn at your pace, anytime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeroSection;
