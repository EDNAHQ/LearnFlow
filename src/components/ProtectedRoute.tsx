
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const checkAndCreateProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        // Check if profile exists
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
        toast.error("Failed to verify user profile. Please try again or contact support.");
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !profileChecked) {
      checkAndCreateProfile();
    } else if (!user) {
      setProfileLoading(false);
    }
  }, [user, profileChecked]);

  if (loading || profileLoading) {
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

  return <>{children}</>;
}
