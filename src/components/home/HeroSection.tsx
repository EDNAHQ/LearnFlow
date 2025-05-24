
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopicInput from "@/components/TopicInput";
import { motion } from "framer-motion";
import { BookText, Presentation, Headphones } from "lucide-react";

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
      <div className="container max-w-2xl mx-auto px-4">
        {/* Simplified Hero - Just the heading and input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full bg-white rounded-xl shadow-sm p-8 md:p-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-gray-800 via-brand-purple to-brand-pink bg-clip-text text-transparent">
            What do you want to learn today?
          </h1>
          
          {/* Learning modes visualization */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center gap-6 md:gap-12 mb-8"
          >
            {/* Text Mode */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-2">
                <BookText size={32} className="text-brand-purple" />
              </div>
              <span className="text-sm font-medium text-gray-700">Read</span>
            </div>
            
            {/* Presentation Mode */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-2">
                <Presentation size={32} className="text-brand-pink" />
              </div>
              <span className="text-sm font-medium text-gray-700">Present</span>
            </div>
            
            {/* Audio Mode */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-2">
                <Headphones size={32} className="text-brand-gold" />
              </div>
              <span className="text-sm font-medium text-gray-700">Audio</span>
            </div>
          </motion.div>
          
          <TopicInput onSubmit={handleSubmit} loading={loading} />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
