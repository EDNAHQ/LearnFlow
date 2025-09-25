import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';

interface CtaSectionProps {
  onStartLearning: () => void;
}

const CtaSection = ({ onStartLearning }: CtaSectionProps) => {
  return (
    <div className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 brand-gradient opacity-30" />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.04)_50%,transparent_70%)]" />
        <img
          src="/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_0.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-45 saturate-125 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-8 animate-fade-down">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Limited Time Offer</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-down" style={{ animationDelay: '0.2s' }}>
          Ready to Transform Your Learning?
        </h2>

        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-light animate-fade-down" style={{ animationDelay: '0.4s' }}>
          Join thousands of learners who are already accelerating their growth with AI-powered personalized learning paths.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.6s' }}>
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
            className="bg-white text-[#6654f5] hover:bg-white/90 px-12 py-6 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="mt-4 text-sm text-white/70">
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default CtaSection;
 