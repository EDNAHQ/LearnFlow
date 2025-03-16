
import React from "react";
import { motion } from "framer-motion";
import TopicInput from "@/components/TopicInput";
import { Sparkles } from "lucide-react";
import PopularTopics from "./PopularTopics";

interface TopicInputSectionProps {
  loading: boolean;
  onSubmit: (topic: string) => void;
}

const TopicInputSection = ({ loading, onSubmit }: TopicInputSectionProps) => {
  return (
    <motion.div
      className="relative z-10 w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.7 }}
      id="topic-input-section"
    >
      <motion.div 
        className="rounded-xl md:rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl p-6 md:p-8 hover:shadow-brand transition-shadow duration-500 relative z-20"
        whileHover={{ boxShadow: "0 20px 25px -5px rgba(109, 66, 239, 0.15), 0 10px 10px -5px rgba(109, 66, 239, 0.1)" }}
      >
        <div className="mb-5 md:mb-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center justify-center">
            <span className="bg-brand-purple/10 text-brand-purple p-2 md:p-3 rounded-full mr-3 md:mr-4">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
            </span>
            What would you like to learn?
          </h3>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Enter any topic and we'll create a personalized learning plan for you
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <TopicInput onSubmit={onSubmit} loading={loading} />
        </div>
        
        <div className="mt-6 md:mt-8">
          <PopularTopics onTopicSelect={onSubmit} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TopicInputSection;
