
import React from "react";
import { MainNav } from "@/components/MainNav";
import HeroSection from "@/components/home/HeroSection";
import RecentProjectsSection from "@/components/home/RecentProjectsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import CTASection from "@/components/home/CTASection";
import HomeFooter from "@/components/home/HomeFooter";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white text-gray-800">
      <MainNav />
      
      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <RecentProjectsSection />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection />
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default HomePage;
