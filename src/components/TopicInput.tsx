
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

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
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
          <Input
            type="text"
            placeholder='Try "Machine Learning", "JavaScript", "Quantum Physics"...'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`pr-14 py-7 text-lg rounded-lg ${isFocused ? 'border-brand-purple' : 'border-gray-200'} ring-offset-brand-purple shadow-sm focus:shadow-md transition-shadow`}
            disabled={loading}
            autoFocus
          />
          
          <Button 
            type="submit" 
            disabled={!topic.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-lg"
            variant={!topic.trim() ? "secondary" : "brand"}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        
        {loading && (
          <div className="mt-4 text-brand-purple flex items-center justify-center">
            <div className="mr-2 h-5 w-5 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin"></div>
            Creating your learning experience...
          </div>
        )}
        
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 mr-2 text-brand-gold" />
            Powered by AI • Personalized for you
          </span>
        </div>
      </form>
    </div>
  );
};

export default TopicInput;
