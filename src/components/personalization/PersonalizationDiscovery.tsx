import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Brain, Zap, Lightbulb, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DiscoveryType = 
  | 'preference' 
  | 'pattern' 
  | 'enhancement' 
  | 'insight' 
  | 'achievement'
  | 'learning';

interface PersonalizationDiscoveryProps {
  type: DiscoveryType;
  message: string;
  detail?: string;
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const discoveryConfig = {
  preference: {
    icon: TrendingUp,
    gradient: 'from-brand-purple to-brand-pink',
    bgGradient: 'from-brand-purple/10 to-brand-pink/10',
    borderColor: 'border-brand-purple/30',
    glowColor: 'shadow-brand-purple/20',
  },
  pattern: {
    icon: Brain,
    gradient: 'from-brand-pink to-brand-gold',
    bgGradient: 'from-brand-pink/10 to-brand-gold/10',
    borderColor: 'border-brand-pink/30',
    glowColor: 'shadow-brand-pink/20',
  },
  enhancement: {
    icon: Zap,
    gradient: 'from-brand-gold to-brand-purple',
    bgGradient: 'from-brand-gold/10 to-brand-purple/10',
    borderColor: 'border-brand-gold/30',
    glowColor: 'shadow-brand-gold/20',
  },
  insight: {
    icon: Lightbulb,
    gradient: 'from-brand-purple to-brand-gold',
    bgGradient: 'from-brand-purple/10 to-brand-gold/10',
    borderColor: 'border-brand-purple/30',
    glowColor: 'shadow-brand-purple/20',
  },
  achievement: {
    icon: CheckCircle2,
    gradient: 'from-brand-gold to-brand-pink',
    bgGradient: 'from-brand-gold/10 to-brand-pink/10',
    borderColor: 'border-brand-gold/30',
    glowColor: 'shadow-brand-gold/20',
  },
  learning: {
    icon: Sparkles,
    gradient: 'from-brand-purple via-brand-pink to-brand-gold',
    bgGradient: 'from-brand-purple/10 via-brand-pink/10 to-brand-gold/10',
    borderColor: 'border-brand-purple/30',
    glowColor: 'shadow-brand-purple/20',
  },
};

export const PersonalizationDiscovery: React.FC<PersonalizationDiscoveryProps> = ({
  type,
  message,
  detail,
  isVisible,
  onDismiss,
  duration = 5000,
}) => {
  const config = discoveryConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <motion.div
            className={cn(
              'relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-2xl',
              config.borderColor,
              config.glowColor
            )}
            whileHover={{ scale: 1.02 }}
            initial={{ rotate: -2 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Animated background gradient */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50',
                config.bgGradient
              )}
            />

            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="h-6 w-6 text-brand-purple" />
            </motion.div>

            <div className="relative flex items-start gap-4">
              {/* Icon with gradient background */}
              <motion.div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                  config.gradient
                )}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-purple">
                    LearnFlow Discovery
                  </span>
                </div>
                <p className="text-sm font-medium text-brand-black leading-tight">
                  {message}
                </p>
                {detail && (
                  <p className="mt-1.5 text-xs font-light text-gray-600 leading-relaxed">
                    {detail}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={onDismiss}
                className="absolute top-2 right-2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Dismiss"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            {duration > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

