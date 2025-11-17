import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/profile/useUserProfile";
import CapabilityOnboardingWizard from "@/components/onboarding/CapabilityOnboardingWizard";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, refetch } = useUserProfile();
  const [profileChecked, setProfileChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkAndCreateProfile = async () => {
      if (!user) {
        setProfileChecked(true);
        return;
      }

      try {
        // Check if basic profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error checking profile:", profileError);
          throw profileError;
        }

        // If profile doesn't exist, create one
        if (!profile) {
          console.log("Creating new profile for user:", user.id);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email ? user.email.split('@')[0] : null
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            throw insertError;
          }
        }

        setProfileChecked(true);
      } catch (error) {
        console.error("Profile verification failed:", error);
      }
    };

    if (user && !profileChecked) {
      checkAndCreateProfile();
    } else if (!user) {
      setProfileChecked(true);
    }
  }, [user, profileChecked]);

  // Check onboarding status once profile is loaded
  useEffect(() => {
    if (profileChecked && profile && !profileLoading) {
      // Show onboarding if not completed
      if (!profile.onboarding_completed) {
        setShowOnboarding(true);
      }
    }
  }, [profile, profileLoading, profileChecked]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refetch profile to get updated onboarding status
    await refetch();
  };

  if (loading || profileLoading || !profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-learn-200 border-t-learn-500 animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    // Instead of redirecting to /auth, show a login prompt
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">You need to be logged in to access this content</h2>
          <p className="mt-2 text-gray-600">Please sign in to continue your learning journey</p>
        </div>
        <Navigate to="/auth?returnTo=current" replace />
      </div>
    );
  }

  return (
    <>
      {showOnboarding && (
        <CapabilityOnboardingWizard
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
      {children}
    </>
  );
}



