
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          What would you like to learn?
        </h2>
        <p className="text-gray-600">
          Enter any topic to get a personalized learning experience
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
          <Input
            type="text"
            placeholder="Try "Machine Learning", "JavaScript", "Quantum Physics"..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`pl-5 pr-14 py-7 text-lg rounded-xl shadow-lg border-2 ${isFocused ? 'border-brand-purple' : 'border-transparent'} bg-white transition-all duration-300`}
            disabled={loading}
          />
          
          <Button 
            type="submit" 
            disabled={!topic.trim() || loading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-lg transition-all duration-300
              ${!topic.trim() ? 'bg-gray-300' : 'bg-brand-purple hover:bg-brand-purple/90'}`}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
        
        {loading && (
          <motion.div 
            className="mt-4 text-brand-purple flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mr-2 h-5 w-5 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin"></div>
            Creating your learning experience...
          </motion.div>
        )}
        
        <motion.div 
          className="mt-4 flex items-center justify-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="h-4 w-4 mr-2 text-brand-gold" />
          Powered by AI • Personalized for you
        </motion.div>
      </form>
    </motion.div>
  );
};

export default TopicInput;
