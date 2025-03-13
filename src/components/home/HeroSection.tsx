
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TopicInput from "@/components/TopicInput";
import { Button } from "@/components/ui/button";
import { Book, Brain, Code, Atom, Type, ChefHat, Sparkles } from "lucide-react";
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

  // Popular topics with icons
  const popularTopics = [
    { name: "Machine Learning", icon: <Brain className="w-3.5 h-3.5 mr-1" /> },
    { name: "JavaScript", icon: <Code className="w-3.5 h-3.5 mr-1" /> },
    { name: "Quantum Physics", icon: <Atom className="w-3.5 h-3.5 mr-1" /> },
    { name: "Creative Writing", icon: <Type className="w-3.5 h-3.5 mr-1" /> },
    { name: "Cooking", icon: <ChefHat className="w-3.5 h-3.5 mr-1" /> },
  ];

  return (
    <section className="w-full py-12 md:py-24 relative">
      {/* Enhanced animated background elements */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='smallGrid' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%236D42EF' stroke-width='0.5' opacity='0.3'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23smallGrid)'/%3e%3c/svg%3e")`,
          backgroundSize: '50px 50px',
          zIndex: 1
        }}
      />
      
      <div className="container grid md:grid-cols-2 gap-12 items-center relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-20"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <span className="bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full font-medium inline-flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by AI • Future of Learning
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <span className="bg-gradient-to-r from-gray-800 via-brand-purple to-brand-pink bg-clip-text text-transparent">
              Master any topic with personalized learning
            </span>
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl"
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
              className="brand-btn-primary shadow-lg shadow-brand-purple/25 px-8 hover:translate-y-[-2px] transition-all"
              onClick={handleStartLearning}
            >
              <Sparkles className="mr-2 h-5 w-5" />
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
              <TopicInput onSubmit={handleSubmit} loading={loading} />
            </div>
            
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="text-sm text-gray-700 mb-3 font-medium flex items-center">
                <span className="bg-brand-gold/10 text-brand-gold p-1 rounded-full mr-2">
                  <Sparkles className="h-4 w-4" />
                </span>
                Popular topics
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map(({ name, icon }) => (
                  <motion.span 
                    key={name}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-brand-purple hover:text-white rounded-full text-sm cursor-pointer transition-colors text-gray-800 hover:shadow-sm flex items-center"
                    onClick={() => handleSubmit(name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {icon}
                    {name}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          {/* Enhanced decorative elements */}
          <div className="absolute -z-10 top-1/4 -right-10 w-40 h-40 rounded-full bg-brand-pink/20 blur-3xl"></div>
          <div className="absolute -z-10 -bottom-10 -left-10 w-48 h-48 rounded-full bg-brand-purple/20 blur-3xl"></div>
          
          {/* Enhanced floating particles */}
          <motion.div 
            className="absolute -right-4 top-10 w-4 h-4 rounded-full bg-brand-gold/40 z-10"
            animate={{
              y: [0, 15, 0],
              x: [0, 5, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute right-20 top-20 w-2 h-2 rounded-full bg-brand-purple/40 z-10"
            animate={{
              y: [0, -10, 0],
              x: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute left-10 bottom-10 w-3 h-3 rounded-full bg-brand-pink/40 z-10"
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
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
