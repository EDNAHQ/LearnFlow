import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

const STORAGE_KEY = 'learnflow_personalization_banner_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PersonalizationMarketingBannerProps {
  onStartLearning?: () => void;
}

export const PersonalizationMarketingBanner: React.FC<PersonalizationMarketingBannerProps> = ({
  onStartLearning,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only show for logged-in users
    if (!user) return;

    // Check if banner was dismissed recently
    const dismissedTimestamp = localStorage.getItem(STORAGE_KEY);
    if (dismissedTimestamp) {
      const dismissedTime = parseInt(dismissedTimestamp, 10);
      const now = Date.now();
      const timeSinceDismissal = now - dismissedTime;

      // If dismissed less than DISMISS_DURATION ago, don't show
      if (timeSinceDismissal < DISMISS_DURATION) {
        return;
      }
    }

    // Show banner after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleGetStarted = () => {
    handleDismiss();
    if (onStartLearning) {
      onStartLearning();
    } else {
      navigate('/projects');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold rounded-2xl p-[2px]">
                <div className="bg-white rounded-2xl h-full w-full" />
              </div>

              {/* Content container */}
              <div className="relative bg-white rounded-2xl overflow-hidden">
                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="absolute right-4 top-4 z-10 rounded-full p-2 bg-white/80 hover:bg-white transition-colors shadow-sm"
                  aria-label="Close banner"
                >
                  <X className="h-4 w-4 text-brand-black" />
                </button>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left side - Content */}
                  <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                    <DialogHeader className="text-left space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <DialogTitle className="text-3xl md:text-4xl font-medium text-brand-black leading-tight">
                          We Learn{' '}
                          <span className="text-gradient">
                            Everything
                          </span>{' '}
                          About You
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-base md:text-lg font-light text-brand-black/70 leading-relaxed pt-2">
                        Every interaction, every preference, every learning moment helps us understand you better. 
                        Your experience becomes more personalized, more intuitive, and more effective with each session.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Features list */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 bg-brand-purple/10 rounded-lg">
                          <Sparkles className="h-4 w-4 text-brand-purple" />
                        </div>
                        <div>
                          <p className="font-medium text-brand-black">Adaptive Learning Paths</p>
                          <p className="text-sm font-light text-brand-black/60">
                            Content that evolves with your pace and style
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 bg-brand-pink/10 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-brand-pink" />
                        </div>
                        <div>
                          <p className="font-medium text-brand-black">Predictive Recommendations</p>
                          <p className="text-sm font-light text-brand-black/60">
                            We anticipate what you'll want to learn next
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 bg-brand-gold/10 rounded-lg">
                          <Brain className="h-4 w-4 text-brand-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-brand-black">Personalized Content Formats</p>
                          <p className="text-sm font-light text-brand-black/60">
                            Text, audio, visual, or podcast - tailored to your preferences
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleGetStarted}
                        className="w-full md:w-auto brand-gradient text-white font-medium px-8 py-6 text-base hover:opacity-90 transition-opacity"
                      >
                        Start Your Personalized Journey
                      </Button>
                    </div>
                  </div>

                  {/* Right side - Image */}
                  <div className="relative h-64 md:h-auto bg-gradient-to-br from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 overflow-hidden">
                    <img
                      src="/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_1.png"
                      alt="Personalized learning network"
                      className="w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

