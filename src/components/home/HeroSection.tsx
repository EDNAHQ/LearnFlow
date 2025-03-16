
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HeroHeading from "./HeroHeading";
import TopicInputSection from "./TopicInputSection";
import HeroDecorations from "./HeroDecorations";

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
      // Since our new design has the input centered, we can just focus it
      const topicInput = document.getElementById('topic-input-field');
      if (topicInput) {
        topicInput.focus();
      }
    } else {
      // If not logged in, navigate to auth page
      navigate("/auth");
    }
  };

  return (
    <section className="w-full py-16 md:py-24 relative">
      {/* Decorative background elements */}
      <HeroDecorations />
      
      <div className="container flex flex-col items-center relative">
        {/* Top section - Centered Heading */}
        <div className="w-full text-center mb-10 md:mb-12">
          <HeroHeading onStartLearning={handleStartLearning} />
        </div>
        
        {/* Center section - Prominent Topic Input */}
        <div className="w-full max-w-3xl mx-auto">
          <TopicInputSection loading={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
