import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopicInput from "@/components/TopicInput";
import HeroDecorations from "@/components/home/HeroDecorations";

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
      {/* Removed background elements that were blocking the animations */}
      <div className="absolute inset-0 -z-10">
        {/* Keeping only the absolutely necessary decorations with high transparency */}
        <HeroDecorations />
      </div>

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Removed backdrop-blur that was making background invisible */}
          <div className="bg-transparent p-6">
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
                Learn anything with AI
              </span>
            </h1>
            
            {/* Topic input container - fully transparent background */}
            <div className="w-full max-w-3xl mx-auto mt-8 mb-6 bg-transparent">
              <TopicInput onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Removed the floating animated elements that might have added extra visual noise */}
    </section>
  );
};

export default HeroSection;
