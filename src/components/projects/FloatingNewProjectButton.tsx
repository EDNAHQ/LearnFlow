import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLearningCommandStore } from '@/store/learningCommandStore';

export const FloatingNewProjectButton: React.FC = () => {
  const openWidget = useLearningCommandStore((state) => state.openWidget);

  return (
    <motion.div
      className="fixed bottom-8 left-8 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="relative">
        <Button
          onClick={openWidget}
          size="lg"
          className="rounded-2xl w-auto px-6 h-14 brand-gradient text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium">New Project</span>
        </Button>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#f2b347] rounded-full animate-ping" />
      </div>
    </motion.div>
  );
};