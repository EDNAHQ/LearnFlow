
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TopicInput from "@/components/TopicInput";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = (topic: string) => {
    setLoading(true);
    
    // Store the topic in sessionStorage
    sessionStorage.setItem("learn-topic", topic);
    
    // Navigate to the plan page after a short delay
    setTimeout(() => {
      navigate("/plan");
    }, 1000);
  };

  const handleStartLearning = () => {
    // If user is logged in, scroll to the topic input
    if (user) {
      // Scroll to the topic input section
      const topicInput = document.getElementById('topic-input-section');
      if (topicInput) {
        topicInput.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not logged in, navigate to auth page
      navigate("/auth");
    }
  };

  return (
    <section className="w-full py-12 md:py-24 relative">
      {/* Circuit Pattern */}
      <div className="absolute top-1/4 left-0 w-full h-full opacity-5 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63" 
                stroke="#6D42EF" strokeWidth="100" fill="none" />
        </svg>
      </div>
      
      <div className="container grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mt-6"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <span className="bg-brand-pink/10 text-brand-pink px-4 py-1 rounded-full font-medium inline-block">Powered by AI • Future of Learning</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-gray-800 via-gray-900 to-brand-purple bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Master any topic with personalized learning
          </motion.h1>
          
          <motion.p
            className="text-lg text-gray-600 mb-8 max-w-xl"
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
              className="brand-btn-primary shadow-brand px-8 hover:translate-y-[-2px] transition-all"
              onClick={handleStartLearning}
            >
              Start Learning
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition-all"
              onClick={() => navigate("/projects")}
            >
              <Book className="mr-2 h-5 w-5" />
              View Projects
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          id="topic-input-section"
        >
          <div className="rounded-2xl overflow-hidden bg-gray-50/80 backdrop-blur-sm border border-gray-200 shadow-subtle p-6 hover:shadow-brand transition-shadow duration-500">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">What would you like to learn?</h3>
              <TopicInput onSubmit={handleSubmit} loading={loading} />
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-700 mb-2 font-medium">Popular topics</div>
              <div className="flex flex-wrap gap-2">
                {["Machine Learning", "JavaScript", "Quantum Physics", "Creative Writing", "Cooking"].map((topic) => (
                  <span 
                    key={topic}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-brand-purple hover:text-white rounded-full text-sm cursor-pointer transition-colors text-gray-800 hover:shadow-sm"
                    onClick={() => handleSubmit(topic)}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/4 -right-10 w-32 h-32 rounded-full bg-brand-pink/10 blur-2xl"></div>
          <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 rounded-full bg-brand-purple/10 blur-2xl"></div>
          
          {/* Floating particles */}
          <motion.div 
            className="absolute -right-4 top-10 w-4 h-4 rounded-full bg-brand-gold/30"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute left-10 bottom-10 w-3 h-3 rounded-full bg-brand-purple/30"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
