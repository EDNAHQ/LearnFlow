import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface HeroSectionProps {
  onStartLearning: () => void;
}

export const HeroSection = ({ onStartLearning }: HeroSectionProps) => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] rounded-[2rem] sm:rounded-[3rem] overflow-hidden flex items-center justify-center">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/videos/social_sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_902bb92b-8a56-4abb-9593-b4f8fd7cc0fa_0.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

        {/* Additional colored overlay for brand colors */}
        <div className="absolute inset-0 brand-gradient opacity-40" />

        {/* Content Container - Centered */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-down leading-tight">
            <span className="block text-white mb-3">Master Any Topic with</span>
            <span className="block text-gradient leading-normal pb-2">Personalized Learning</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-down animation-delay-400">
            Create custom learning paths that adapt to your pace.
            Transform your knowledge with intelligent, adaptive education.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center animate-fade-up animation-delay-600">
            <Button
              onClick={onStartLearning}
              size="lg"
              className="group relative px-10 py-7 text-lg font-semibold text-white rounded-full transform transition-all duration-200 hover:scale-105 shadow-2xl brand-gradient hover:opacity-90"
            >
              <span className="flex items-center gap-2">
                Start Your Journey
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>

          {/* Value props (non-numeric, future-proof) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-fade-up animation-delay-800">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">Guided</div>
              <div className="text-sm text-white/70">Clear steps that keep you moving</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">Personalized</div>
              <div className="text-sm text-white/70">Learning paths tailored to your goals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">Flexible</div>
              <div className="text-sm text-white/70">Learn at your pace, anytime</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;