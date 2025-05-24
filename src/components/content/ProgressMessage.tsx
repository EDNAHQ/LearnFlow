
import React from "react";
import { motion } from "framer-motion";
import { Award, TrendingUp } from "lucide-react";

interface ProgressMessageProps {
  completedSteps: number;
  totalSteps: number;
}

const ProgressMessage = ({ completedSteps, totalSteps }: ProgressMessageProps) => {
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  const getMessage = () => {
    if (progressPercentage === 100) {
      return {
        text: "You've completed the entire learning path!",
        icon: <Award className="w-5 h-5 text-brand-gold" />
      };
    } else if (progressPercentage >= 75) {
      return {
        text: `Almost there! You've completed ${progressPercentage}% of your learning path.`,
        icon: <TrendingUp className="w-5 h-5 text-brand-pink" />
      };
    } else if (progressPercentage >= 50) {
      return {
        text: `Halfway through! You've completed ${progressPercentage}% of your learning path.`,
        icon: <TrendingUp className="w-5 h-5 text-brand-purple" />
      };
    } else if (progressPercentage > 0) {
      return {
        text: `Great start! You've completed ${progressPercentage}% of your learning path.`,
        icon: <TrendingUp className="w-5 h-5 text-brand-purple" />
      };
    } else {
      return {
        text: "Begin your learning journey!",
        icon: <TrendingUp className="w-5 h-5 text-brand-purple" />
      };
    }
  };
  
  const messageData = getMessage();
  
  if (completedSteps === 0 && totalSteps === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg mb-4"
    >
      <div className="p-2 bg-white rounded-full shadow-sm">
        {messageData.icon}
      </div>
      <p className="text-gray-800 font-medium">{messageData.text}</p>
    </motion.div>
  );
};

export default ProgressMessage;
