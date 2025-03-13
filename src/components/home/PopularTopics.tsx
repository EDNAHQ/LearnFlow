
import React from "react";
import { motion } from "framer-motion";
import { Brain, Code, Atom, Type, ChefHat, Sparkles } from "lucide-react";

interface PopularTopicsProps {
  onTopicSelect: (topic: string) => void;
}

const PopularTopics = ({ onTopicSelect }: PopularTopicsProps) => {
  // Popular topics with icons
  const popularTopics = [
    { name: "Machine Learning", icon: <Brain className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> },
    { name: "JavaScript", icon: <Code className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> },
    { name: "Quantum Physics", icon: <Atom className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> },
    { name: "Creative Writing", icon: <Type className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> },
    { name: "Cooking", icon: <ChefHat className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> },
  ];

  return (
    <motion.div 
      className="bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <div className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3 font-medium flex items-center">
        <span className="bg-brand-gold/10 text-brand-gold p-1 rounded-full mr-2">
          <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
        </span>
        Popular topics
      </div>
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {popularTopics.map(({ name, icon }) => (
          <motion.span 
            key={name}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-50 hover:bg-brand-purple hover:text-white rounded-full text-xs md:text-sm cursor-pointer transition-colors text-gray-800 hover:shadow-sm flex items-center"
            onClick={() => onTopicSelect(name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {icon}
            {name}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default PopularTopics;
