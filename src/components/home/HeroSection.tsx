
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopicInput from "@/components/TopicInput";
import { motion } from "framer-motion";

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
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
