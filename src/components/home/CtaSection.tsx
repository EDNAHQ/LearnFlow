import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';

interface CtaSectionProps {
  onStartLearning: () => void;
}

const CtaSection = ({ onStartLearning }: CtaSectionProps) => {
  return (
    <div className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Keep brand tint very light so the artwork remains visible */}
      <div className="absolute inset-0 brand-gradient opacity-5" />

      <div className="absolute inset-0">
        <img
          src="/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_0.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-100 saturate-110 contrast-110 scale-105"
        />
        {/* Global multiply darken to balance contrast without hiding details */}
        <div className="absolute inset-0 bg-black/35 mix-blend-multiply" />
        {/* Very light edge vignette to ground the section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Localized radial scrim: stronger center, smooth falloff; keeps image readable while boosting text contrast */}
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-4xl bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.4)_45%,transparent_78%)]" aria-hidden="true" />

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 animate-fade-down drop-shadow-[0_8px_16px_rgba(0,0,0,0.75)]" style={{ animationDelay: '0.2s' }}>
          Ready to Transform Your Learning?
        </h2>

        <p className="text-base sm:text-xl text-white mb-10 sm:mb-12 max-w-2xl mx-auto font-light animate-fade-down drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]" style={{ animationDelay: '0.4s' }}>
          Join thousands of learners who are already accelerating their growth with AI-powered personalized learning paths.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Free to Start</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">No Credit Card</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Instant Access</span>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '0.8s' }}>
          <Button
            onClick={onStartLearning}
            size="lg"
            className="bg-white text-[#6654f5] hover:bg-white/90 px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/80">
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default CtaSection;
 