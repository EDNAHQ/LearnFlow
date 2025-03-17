
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopicInput from "@/components/TopicInput";
import AnimatedBackgroundPaths from "@/components/home/FloatingPaths";

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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-10">
      {/* Background elements - including the new animated paths */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-purple/5 to-brand-pink/5"></div>
        
        {/* Animated floating paths */}
        <AnimatedBackgroundPaths />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-brand-gold/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-brand-purple/10 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-brand-pink/10 blur-2xl"></div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
              Learn anything with AI
            </span>
          </h1>
          
          {/* Topic input container */}
          <div className="w-full max-w-3xl mx-auto mt-8 mb-6">
            <TopicInput onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
      
      {/* Floating animated elements */}
      <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-brand-purple/50 animate-pulse-soft"></div>
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-brand-pink/50 animate-pulse-soft delay-150"></div>
      <div className="absolute top-2/3 right-1/3 w-4 h-4 rounded-full bg-brand-gold/50 animate-pulse-soft delay-300"></div>
    </section>
  );
};

export default HeroSection;
