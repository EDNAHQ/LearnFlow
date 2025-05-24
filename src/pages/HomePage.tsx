
import React from "react";
import { MainNav } from "@/components/MainNav";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import CTASection from "@/components/home/CTASection";
import HomeFooter from "@/components/home/HomeFooter";
import AnimatedBackgroundPaths from "@/components/home/FloatingPaths";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white text-gray-800 relative overflow-hidden">
      {/* Animated background paths with reduced opacity */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        <AnimatedBackgroundPaths />
      </div>
      
      <MainNav />
      
      {/* Main Content */}
      <main className="flex-1 relative w-full z-[1]">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection />
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default HomePage;
