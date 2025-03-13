
import React from "react";
import { MainNav } from "@/components/MainNav";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import CTASection from "@/components/home/CTASection";
import HomeFooter from "@/components/home/HomeFooter";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white text-gray-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed -z-10 top-0 right-0 w-1/2 h-1/2 bg-brand-purple/5 rounded-full blur-3xl"></div>
      <div className="fixed -z-10 bottom-0 left-0 w-1/3 h-1/3 bg-brand-pink/5 rounded-full blur-3xl"></div>
      
      <MainNav />
      
      {/* Main Content */}
      <main className="flex-1 relative w-full">
        {/* Decorative Pattern - Top */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-xl"></div>
        
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
