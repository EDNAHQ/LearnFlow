
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface PlanAuthErrorProps {
  handleLogin: () => void;
}

const PlanAuthError = ({ handleLogin }: PlanAuthErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center mb-4">
        <LogIn className="h-8 w-8 text-brand-gold" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">Authentication Required</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        You need to be logged in to create and save learning plans. Your plans will be stored in your account so you can access them anytime.
      </p>
      <Button onClick={handleLogin} className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect">
        <LogIn className="h-4 w-4" />
        Sign In or Create Account
      </Button>
    </div>
  );
};

export default PlanAuthError;
