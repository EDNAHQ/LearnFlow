import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/ui";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import VideoBackground from "@/components/common/VideoBackground";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email sent!",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

      {/* Form Section - Right 1/3 */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center px-6 sm:px-8 lg:px-12 bg-white">
        <div className="w-full max-w-sm mx-auto">
          {/* Back to Sign In Link */}
          <Link
            to="/sign-in"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#6654f5] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>

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

          {!emailSent ? (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#6654f5] focus:ring-[#6654f5] hover:border-gray-300 transition-colors h-11"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] hover:opacity-90 text-white font-semibold py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 sm:mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link
                      to="/sign-in"
                      className="font-semibold text-[#6654f5] hover:text-[#ca5a8b] transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          ) : (
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
                Check Your Email
              </h2>

              <div className="bg-gradient-to-r from-[#6654f5]/10 to-[#ca5a8b]/10 rounded-2xl p-6 mb-6">
                <Mail className="w-8 h-8 text-[#6654f5] mx-auto mb-3" />
                <p className="text-gray-700 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-gray-900 break-all">
                  {email}
                </p>
              </div>

              <p className="text-gray-600 mb-8">
                Click the link in the email to create a new password.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-[#6654f5]/20 rounded-full py-6 transition-all duration-200"
                >
                  Try Another Email
                </Button>

                <Button asChild className="w-full bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] hover:opacity-90 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full">
                  <Link to="/sign-in">
                    Return to Sign In
                  </Link>
                </Button>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Didn't receive the email?</span>
                  <br />
                  Check your spam folder or try again with a different email.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;