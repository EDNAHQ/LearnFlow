
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopicInput from "@/components/TopicInput";
import { motion } from "framer-motion";
import { Star, Users, BookOpen } from "lucide-react";

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
          <TopicInput onSubmit={handleSubmit} loading={loading} />
          
          {/* Social Proof Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-brand-purple mr-1" />
                  <span className="font-bold text-lg">10,000+</span>
                </div>
                <p className="text-xs text-gray-500">Active Learners</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-brand-pink mr-1" />
                  <span className="font-bold text-lg">500+</span>
                </div>
                <p className="text-xs text-gray-500">Topics Available</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-brand-gold mr-1" />
                  <span className="font-bold text-lg">4.8/5</span>
                </div>
                <p className="text-xs text-gray-500">User Rating</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
