import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/auth";
import { MainNav } from "@/components/navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedPathsSection } from "@/components/home/FeaturedPathsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TopicsSection } from "@/components/home/TopicsSection";
import CtaSection from "@/components/home/CtaSection";
import HomeFooter from "@/components/home/HomeFooter";
import { LearningDNA } from "@/components/home/personalization/LearningDNA";
import { PromptInsights } from "@/components/home/personalization/PromptInsights";
import { SkillGaps } from "@/components/home/personalization/SkillGaps";
import { AdaptiveDifficulty } from "@/components/home/personalization/AdaptiveDifficulty";
import { TimeBasedRecommendations } from "@/components/home/personalization/TimeBasedRecommendations";
import { PredictiveRecommendations } from "@/components/home/personalization/PredictiveRecommendations";
import { useLearningCommandStore } from "@/store/learningCommandStore";
import LearningJourneyWizard from "@/components/journey/LearningJourneyWizard";
import { FloatingNewProjectButton } from "@/components/projects/FloatingNewProjectButton";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [showJourneyWizard, setShowJourneyWizard] = useState(false);

  const openWidget = useLearningCommandStore((state) => state.openWidget);

  const handleStartLearning = () => {
    console.log('Start learning clicked, user:', user);
    // Check if user is logged in
    if (!user) {
      // Redirect to sign in page if not logged in
      navigate('/sign-in');
      return;
    }
    // Show the Learning Journey Wizard instead of the regular widget
    setShowJourneyWizard(true);
  };

  // Only render personalization components when auth is loaded and session is valid
  const shouldShowPersonalization = !authLoading && user && session && session.access_token;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <MainNav />
      <main className="flex-1">
        <HeroSection onStartLearning={handleStartLearning} />
        <AnimatePresence>
          {shouldShowPersonalization && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, staggerChildren: 0.1 }}
            >
              <TimeBasedRecommendations />
              <LearningDNA />
              <PromptInsights />
              <SkillGaps />
              <AdaptiveDifficulty />
              <PredictiveRecommendations />
            </motion.div>
          )}
        </AnimatePresence>
        <FeaturedPathsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TopicsSection />
        <CtaSection onStartLearning={handleStartLearning} />
      </main>
      <HomeFooter />

      {/* Learning Journey Wizard Modal */}
      {showJourneyWizard && (
        <LearningJourneyWizard
          isOpen={showJourneyWizard}
          onClose={() => setShowJourneyWizard(false)}
        />
      )}

      {/* Floating New Project Button */}
      <AnimatePresence>
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <FloatingNewProjectButton onClick={handleStartLearning} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;