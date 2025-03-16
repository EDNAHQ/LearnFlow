
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Book, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeroHeadingProps {
  onStartLearning: () => void;
}

const HeroHeading = ({ onStartLearning }: HeroHeadingProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative z-20 flex flex-col items-center"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-4 md:mb-6"
      >
        <span className="bg-brand-pink/10 text-brand-pink px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium inline-flex items-center">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          Powered by AI • Future of Learning
        </span>
      </motion.div>
      
      <motion.h1 
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-center max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        <span className="bg-gradient-to-r from-gray-800 via-brand-purple to-brand-pink bg-clip-text text-transparent">
          Master any topic with personalized learning
        </span>
      </motion.h1>
      
      <motion.p
        className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        LearnFlow uses AI to generate customized learning plans and content 
        based on any topic you want to explore. Get started in seconds!
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="flex flex-col sm:flex-row gap-3 md:gap-4"
      >
        <Button 
          size="default"
          className="brand-btn-primary shadow-lg shadow-brand-purple/25 px-6 md:px-8 py-2 text-sm md:text-base hover:translate-y-[-2px] transition-all"
          onClick={onStartLearning}
        >
          <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          Start Learning
        </Button>
        
        <Button
          variant="outline"
          size="default"
          className="border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition-all text-sm md:text-base py-2"
          onClick={() => navigate("/projects")}
        >
          <Book className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          View Projects
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default HeroHeading;
