
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
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
        "mb-4 p-5 rounded-xl transition-all duration-300 cursor-pointer",
        isActive 
          ? "glass-panel-strong border-learn-200 shadow-md" 
          : "glass-panel hover:shadow-subtle"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-learn-100 flex items-center justify-center text-learn-700 font-medium">
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
