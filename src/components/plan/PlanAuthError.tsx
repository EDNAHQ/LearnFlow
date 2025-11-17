import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";

interface PlanAuthErrorProps {
  handleLogin: () => void;
}

const PlanAuthError = ({ handleLogin }: PlanAuthErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-brand-gold/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <LogIn className="h-12 w-12 text-brand-gold" />
        </div>
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-3xl sm:text-4xl font-medium text-white mb-4"
      >
        Authentication Required
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg sm:text-xl font-light text-white/80 mb-8 max-w-md"
      >
        You need to be logged in to create and save learning plans. Your plans will be stored in your account so you can access them anytime.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Button
          onClick={handleLogin}
          className="gap-2 brand-gradient text-white hover:opacity-90 px-8 py-6 text-lg rounded-2xl font-medium shadow-lg"
        >
          <LogIn className="h-5 w-5" />
          Sign In or Create Account
        </Button>
      </motion.div>
    </div>
  );
};

export default PlanAuthError;
