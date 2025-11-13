import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/ui";
import { supabase } from "@/integrations/supabase/client";
import VideoBackground from "@/components/common/VideoBackground";

const SignUpSuccess = () => {
  const { toast } = useToast();
  const [isResending, setIsResending] = React.useState(false);

  // Get email from URL params (passed from signup)
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address not found. Please sign up again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-white">
      {/* Video/Image Section - Left 2/3 */}
      <VideoBackground
        videoSrc="/videos/social_sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_902bb92b-8a56-4abb-9593-b4f8fd7cc0fa_3.mp4"
        imageSrc="/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_3.png"
        className="hidden lg:block lg:w-2/3 overflow-hidden"
        overlayClassName="bg-gradient-to-r from-transparent via-transparent to-black/50"
      />

      {/* Success Message - Right 1/3 */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center px-8 lg:px-12 bg-white">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] rounded-lg blur-xl opacity-25"></div>
                <h1 className="relative text-5xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight">
                  LearnFlow
                </h1>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-3 tracking-wide uppercase">by Enterprise DNA</p>
            </div>
          </div>

          {/* Success Content */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] blur-xl opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-[#6654f5] to-[#ca5a8b] rounded-full">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Check Your Email!
            </h2>

            <div className="bg-gradient-to-r from-[#6654f5]/10 to-[#ca5a8b]/10 rounded-2xl p-6 mb-6">
              <Mail className="w-8 h-8 text-[#6654f5] mx-auto mb-3" />
              <p className="text-gray-700 mb-2">
                We've sent a verification email to:
              </p>
              <p className="font-semibold text-gray-900 break-all">
                {email || 'your email address'}
              </p>
            </div>

            <p className="text-gray-600 mb-8">
              Click the link in the email to verify your account and start your learning journey.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full border-2 border-gray-200 hover:border-[#6654f5]/20 rounded-full py-6 group transition-all duration-200"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button asChild className="w-full bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] hover:opacity-90 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full">
                <Link to="/sign-in">
                  <span className="flex items-center justify-center gap-2">
                    Continue to Sign In
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
              </Button>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Didn't receive the email?</span>
                <br />
                Check your spam folder or click resend above.
              </p>
            </div>

            <div className="mt-6">
              <Link
                to="/sign-up"
                className="text-sm text-gray-500 hover:text-[#6654f5] transition-colors"
              >
                ← Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpSuccess;