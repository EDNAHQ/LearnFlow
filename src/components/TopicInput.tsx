
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
      className="w-full max-w-full mx-auto relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <Input
          type="text"
          placeholder="Enter a specific topic you want to learn about..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="input-light pl-10 pr-12 h-14 text-base shadow-sm transition-all duration-300 focus:shadow-md border-gray-200 focus:border-brand-purple/50"
          disabled={loading}
        />
        <motion.div 
          className="text-xs text-gray-500 mt-1.5 ml-1 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="h-3 w-3 mr-1 text-brand-gold" />
          For best results, enter a specific topic (e.g., "Python decorators" instead of just "Python")
        </motion.div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={!topic.trim() || loading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-300 
            ${!topic.trim() ? 'bg-gray-400' : 'bg-brand-purple hover:bg-brand-purple/90 shadow-sm hover:shadow-md'}`}
          style={{ top: "calc(50% - 7px)" }}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      {loading && (
        <motion.div 
          className="mt-3 text-sm text-brand-purple flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mr-2 size-4 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin"></div>
          Creating your personalized learning journey...
        </motion.div>
      )}
    </motion.form>
  );
};

export default TopicInput;
