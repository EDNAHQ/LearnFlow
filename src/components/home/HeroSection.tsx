
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopicInput from "@/components/TopicInput";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <span className="bg-brand-purple/10 text-brand-purple px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Learning
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-800 via-brand-purple to-brand-pink bg-clip-text text-transparent">
              Master any topic with personalized learning
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            LearnFlow uses AI to generate customized learning plans and content 
            based on any topic you want to explore. Get started in seconds!
          </p>
        </motion.div>

        {/* Topic Input Container - Main Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">What do you want to learn today?</h2>
            <TopicInput onSubmit={handleSubmit} loading={loading} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
