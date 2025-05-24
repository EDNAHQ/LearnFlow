
import React from "react";
import { useLearningSteaks } from "@/hooks/useLearningSteaks";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const StreakIndicator = () => {
  const { streakData, loading } = useLearningSteaks();
  const { user } = useAuth();
  
  if (!user || loading) return null;
  
  return (
    <motion.div 
      className="flex items-center gap-1.5 text-sm font-medium"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-center bg-brand-gold/10 text-brand-gold rounded-full py-1 px-2.5">
        <Flame className="w-4 h-4 mr-1" />
        <span>{streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''}</span>
      </div>
    </motion.div>
  );
};

export default StreakIndicator;
