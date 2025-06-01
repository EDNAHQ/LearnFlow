
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
        className="mb-4"
      >
        <span className="bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Learning
        </span>
      </motion.div>
      
      <motion.h1 
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        <span className="bg-gradient-to-r from-gray-800 via-brand-purple to-brand-pink bg-clip-text text-transparent">
          Master any topic with personalized learning
        </span>
      </motion.h1>
      
      <motion.p
        className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl text-center leading-relaxed"
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
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button 
          size="lg"
          className="bg-brand-purple hover:bg-opacity-90 text-white shadow-lg shadow-brand-purple/20 px-8"
          onClick={onStartLearning}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Start Learning
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="border-gray-300 text-gray-800 hover:bg-gray-50"
          onClick={() => navigate("/projects")}
        >
          <Book className="mr-2 h-5 w-5" />
          View Projects
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default HeroHeading;
