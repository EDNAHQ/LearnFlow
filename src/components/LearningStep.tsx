
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Step {
  id: string; // Changed from number to string to match Supabase UUID
  title: string;
  description: string;
}

interface LearningStepProps {
  step: Step;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
}

const LearningStep = ({ 
  step, 
  index, 
  isActive = false,
  onClick 
}: LearningStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "mb-4 p-5 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-brand",
        isActive 
          ? "border-l-4 border-l-brand-purple bg-white shadow-md" 
          : "border border-gray-200 bg-white hover:border-brand-purple/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-medium">
          {index + 1}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-1">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningStep;
