
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  loading?: boolean;
}

const TopicInput = ({ onSubmit, loading = false }: TopicInputProps) => {
  const [topic, setTopic] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="w-full mx-auto relative z-20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-30">
          <Search className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <Input
          id="topic-input-field"
          type="text"
          placeholder="Enter a specific topic you want to learn about..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="input-light pl-12 pr-14 h-14 md:h-16 text-base md:text-lg shadow-sm transition-all duration-300 focus:shadow-md border-gray-200 focus:border-brand-purple/50 relative z-20 rounded-xl"
          disabled={loading}
        />
        <motion.div 
          className="text-xs md:text-sm text-gray-500 mt-2 md:mt-2.5 ml-2 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 text-brand-gold" />
          For best results, enter a specific topic (e.g., "Python decorators" instead of just "Python")
        </motion.div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={!topic.trim() || loading}
          className={`absolute right-2 md:right-3 top-1/2 -translate-y-1/2 h-10 w-10 md:h-11 md:w-11 transition-all duration-300 z-30
            ${!topic.trim() ? 'bg-gray-400' : 'bg-brand-purple hover:bg-brand-purple/90 shadow-sm hover:shadow-md'}`}
          style={{ top: "calc(50% - 10px)" }}
        >
          <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
      {loading && (
        <motion.div 
          className="mt-3 md:mt-4 text-sm md:text-base text-brand-purple flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mr-2 size-4 md:size-5 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin"></div>
          Creating your personalized learning journey...
        </motion.div>
      )}
    </motion.form>
  );
};

export default TopicInput;
