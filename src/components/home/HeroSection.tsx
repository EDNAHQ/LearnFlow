
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
      {/* Decorative background elements */}
      <HeroDecorations />
      
      <div className="container grid md:grid-cols-2 gap-12 items-center relative">
        {/* Left side - Heading and CTA buttons */}
        <HeroHeading onStartLearning={handleStartLearning} />
        
        {/* Right side - Topic input and popular topics */}
        <TopicInputSection loading={loading} onSubmit={handleSubmit} />
      </div>
    </section>
  );
};

export default HeroSection;
