
import { useState, useEffect } from "react";
import { Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface KnowledgeNuggetLoadingProps {
  topic: string | null;
  goToProjects: () => void;
}

const KnowledgeNuggetLoading = ({ topic, goToProjects }: KnowledgeNuggetLoadingProps) => {
  const [nuggets, setNuggets] = useState<string[]>([]);
  const [currentNuggetIndex, setCurrentNuggetIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNuggets = async () => {
      if (!topic) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('generate-knowledge-nuggets', {
          body: { topic },
        });

        if (error) throw new Error(error.message);
        
        if (data.nuggets && data.nuggets.length > 0) {
          setNuggets(data.nuggets);
        } else {
          // Fallback nuggets if the API doesn't return any
          setNuggets([
            `Did you know? Learning about ${topic} boosts problem-solving skills.`,
            `${topic} concepts are used in various real-world applications.`,
            `Understanding ${topic} fundamentals helps in mastering advanced topics.`,
            `Regular practice is key to mastering ${topic}.`,
            `${topic} knowledge connects to many other fields of study.`
          ]);
        }
      } catch (err) {
        console.error('Error fetching nuggets:', err);
        setError('Failed to load knowledge nuggets');
        // Set fallback nuggets
        setNuggets([
          `Did you know? Learning about ${topic} boosts problem-solving skills.`,
          `${topic} concepts are used in various real-world applications.`,
          `Understanding ${topic} fundamentals helps in mastering advanced topics.`,
          `Regular practice is key to mastering ${topic}.`,
          `${topic} knowledge connects to many other fields of study.`
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNuggets();
  }, [topic]);

  useEffect(() => {
    // Auto-rotate through nuggets
    if (nuggets.length > 0) {
      const interval = setInterval(() => {
        setCurrentNuggetIndex(prev => (prev + 1) % nuggets.length);
      }, 8000); // Change every 8 seconds
      
      return () => clearInterval(interval);
    }
  }, [nuggets]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-gray-100 p-6">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#6D42EF]" />
          <h2 className="text-xl font-bold mb-2">
            Preparing your {topic} learning journey...
          </h2>
          <p className="text-gray-400 text-center mb-6">
            We're creating personalized content for you. In the meantime, enjoy these insights:
          </p>

          <div className="w-full h-[180px] mb-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNuggetIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <Card className="bg-gradient-to-br from-[#25252A] to-[#1D1D22] border-[#6D42EF]/20 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex">
                      <Lightbulb className="w-6 h-6 mr-3 text-[#E84393] flex-shrink-0" />
                      <p className="text-gray-100">
                        {nuggets[currentNuggetIndex]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nugget indicators */}
          <div className="flex space-x-2 mb-6">
            {nuggets.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentNuggetIndex 
                    ? 'bg-[#6D42EF]' 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={goToProjects} 
            className="bg-transparent border border-[#6D42EF] text-[#6D42EF] hover:bg-[#6D42EF]/10"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeNuggetLoading;
