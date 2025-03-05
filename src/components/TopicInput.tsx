
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  loading?: boolean;
}

const TopicInput = ({ onSubmit, loading = false }: TopicInputProps) => {
  const [topic, setTopic] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-lg mx-auto relative"
    >
      <div className="relative group">
        <Input
          type="text"
          placeholder="Enter a specific topic you want to learn about..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="pr-12 h-14 text-base transition-shadow duration-300 focus:shadow-subtle bg-gray-800 border-gray-700 text-white"
          disabled={loading}
        />
        <div className="text-xs text-gray-400 mt-1 ml-1">
          For best results, enter a specific topic (e.g., "Python decorators" instead of just "Python")
        </div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={!topic.trim() || loading}
          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100 transition-opacity"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      {loading && (
        <div className="mt-2 text-sm text-gray-400 animate-pulse-soft">
          Creating your personalized learning journey...
        </div>
      )}
    </form>
  );
};

export default TopicInput;
