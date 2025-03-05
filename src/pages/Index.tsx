
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopicInput from "@/components/TopicInput";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (topic: string) => {
    setLoading(true);
    
    // Store the topic in sessionStorage
    sessionStorage.setItem("learn-topic", topic);
    
    // Navigate to the plan page after a short delay
    setTimeout(() => {
      navigate("/plan");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <div className="inline-block">
          <div className="flex items-center justify-center mb-2">
            <div className="relative w-16 h-16 bg-learn-100 rounded-2xl flex items-center justify-center before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-learn-50/50 before:rounded-2xl before:transform before:rotate-12">
              <span className="relative z-10 text-learn-600 text-2xl font-bold">L</span>
            </div>
          </div>
        </div>
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          LearnFlow
        </motion.h1>
        <motion.p 
          className="text-muted-foreground max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Your personalized learning journey begins with a single topic.
        </motion.p>
      </motion.div>

      <motion.div 
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <div className="glass-panel-strong p-6 md:p-8">
          <h2 className="text-xl font-medium mb-6 text-center">What would you like to learn today?</h2>
          <TopicInput onSubmit={handleSubmit} loading={loading} />
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
