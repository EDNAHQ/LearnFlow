
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Brain } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (user && !loading) {
      // Check if we have a returnTo parameter
      const params = new URLSearchParams(location.search);
      const returnTo = params.get('returnTo');
      
      if (returnTo === 'current' && document.referrer) {
        // Try to go back to the referring page
        window.history.back();
      } else {
        // Default navigation to home
        navigate("/");
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-purple/20 border-t-brand-purple animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Creative CTA Content (2/3) */}
      <motion.div 
        className="flex-1 lg:flex-[2] bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] relative overflow-hidden flex items-center justify-center"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-brand-purple"></div>
          <div className="absolute top-40 right-32 w-24 h-24 rounded-full border border-brand-pink"></div>
          <div className="absolute bottom-32 left-40 w-16 h-16 rounded-full border border-brand-gold"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 rounded-full border-2 border-brand-purple/50"></div>
        </div>

        <div className="relative z-10 max-w-xl mx-auto px-8 text-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="mr-3 p-3 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-2xl text-white leading-tight">
                LearnFlow
              </span>
              <span className="text-sm text-white/60 leading-tight">
                by Enterprise DNA
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Learn Smarter with{" "}
            <span className="bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          {/* Simple Description */}
          <motion.p 
            className="text-xl text-white/80 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Personalized learning paths that adapt to you
          </motion.p>
        </div>
      </motion.div>

      {/* Right Side - Authentication Form (1/3) */}
      <motion.div 
        className="flex-1 lg:flex-[1] bg-white flex items-center justify-center p-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-sm">
          <AuthForm />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
