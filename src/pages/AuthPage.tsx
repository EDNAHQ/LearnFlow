
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";

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
      } else if (returnTo) {
        // Navigate to the specified returnTo path
        navigate(returnTo);
      } else {
        // Default navigation to home
        navigate("/");
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-learn-200 border-t-learn-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <div className="inline-block">
          <div className="flex items-center justify-center mb-2">
            <div className="relative w-16 h-16 bg-learn-100 rounded-2xl flex items-center justify-center before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-learn-50/50 before:rounded-2xl before:transform before:rotate-12">
              <span className="relative z-10 text-learn-600 text-2xl font-bold">L</span>
            </div>
          </div>
        </div>
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          LearnFlow
        </motion.h1>
        <motion.p 
          className="text-muted-foreground max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Sign in to start your personalized learning journey.
        </motion.p>
      </motion.div>

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <AuthForm />
      </motion.div>
    </div>
  );
};

export default AuthPage;
