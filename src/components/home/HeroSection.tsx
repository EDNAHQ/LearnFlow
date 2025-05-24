
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopicInput from "@/components/TopicInput";
import HeroDecorations from "@/components/home/HeroDecorations";
import HeroHeading from "@/components/home/HeroHeading";

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
    window.scrollTo({
      top: document.querySelector('.topic-input-container')?.getBoundingClientRect().top,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-12 pb-16">
      {/* Background decorations with reduced opacity */}
      <div className="absolute inset-0 -z-10 opacity-75">
        <HeroDecorations />
      </div>

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Hero content */}
          <div className="mb-16">
            <HeroHeading onStartLearning={handleStartLearning} />
          </div>
          
          {/* Topic input container with subtle shadow and clearer separation */}
          <div className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 topic-input-container">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">What do you want to learn today?</h2>
            <TopicInput onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
