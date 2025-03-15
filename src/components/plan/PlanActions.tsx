
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check } from "lucide-react";

interface PlanActionsProps {
  handleReset: () => void;
  handleApprove: () => void;
}

export const PlanActions = ({ handleReset, handleApprove }: PlanActionsProps) => {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-4 justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Button 
        variant="outline" 
        onClick={handleReset}
        className="gap-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold btn-hover-effect"
      >
        <RefreshCw className="h-4 w-4" />
        Try Another Topic
      </Button>
      <Button 
        onClick={handleApprove}
        className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect"
      >
        <Check className="h-4 w-4" />
        Approve Plan & Continue
      </Button>
    </motion.div>
  );
};
