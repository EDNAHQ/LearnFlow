
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
      className="relative z-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7, duration: 0.7 }}
      id="topic-input-section"
    >
      <motion.div 
        className="rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl p-6 hover:shadow-brand transition-shadow duration-500 relative z-30"
        whileHover={{ boxShadow: "0 20px 25px -5px rgba(109, 66, 239, 0.1), 0 10px 10px -5px rgba(109, 66, 239, 0.04)" }}
      >
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-brand-purple/10 text-brand-purple p-2 rounded-full mr-3">
              <Sparkles className="h-5 w-5" />
            </span>
            What would you like to learn?
          </h3>
          <TopicInput onSubmit={onSubmit} loading={loading} />
        </div>
        
        <PopularTopics onTopicSelect={onSubmit} />
      </motion.div>
    </motion.div>
  );
};

export default TopicInputSection;
