import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { MainNav } from "@/components/navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TopicsSection } from "@/components/home/TopicsSection";
import CtaSection from "@/components/home/CtaSection";
import HomeFooter from "@/components/home/HomeFooter";
import { useLearningCommandStore } from "@/store/learningCommandStore";
import LearningJourneyWizard from "@/components/journey/LearningJourneyWizard";

const HomePage = () => {
  console.log('HomePage rendering...');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showJourneyWizard, setShowJourneyWizard] = useState(false);

  const openWidget = useLearningCommandStore((state) => state.openWidget);

  const handleStartLearning = () => {
    console.log('Start learning clicked, user:', user);
    // Check if user is logged in
    if (!user) {
      // Redirect to sign in page if not logged in
      navigate('/auth/signin');
      return;
    }
    // Show the Learning Journey Wizard instead of the regular widget
    setShowJourneyWizard(true);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <MainNav />
      <main className="flex-1">
        <HeroSection onStartLearning={handleStartLearning} />
        <FeaturesSection />
        <HowItWorksSection />
        <TopicsSection />
        <CtaSection onStartLearning={handleStartLearning} />
      </main>
      <HomeFooter />

      {/* Learning Journey Wizard Modal */}
      <LearningJourneyWizard
        isOpen={showJourneyWizard}
        onClose={() => setShowJourneyWizard(false)}
      />
    </div>
  );
};

export default HomePage;