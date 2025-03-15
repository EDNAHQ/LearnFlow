
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";

interface PlanActionButtonsProps {
  handleReset: () => void;
  handleApprove: () => Promise<void>;
}

const PlanActionButtons = ({ handleReset, handleApprove }: PlanActionButtonsProps) => {
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

export default PlanActionButtons;
