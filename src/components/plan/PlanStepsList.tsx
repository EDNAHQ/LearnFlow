import { motion } from "framer-motion";
import LearningStep, { Step } from "@/components/learning/LearningStep";

interface PlanStepsListProps {
  steps: Step[];
  activeStep: number | null;
  setActiveStep: (index: number) => void;
}

const PlanStepsList = ({ steps, activeStep, setActiveStep }: PlanStepsListProps) => {
  // Mobile: single column, Desktop: grid layout
  const getGridCols = () => {
    return "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full h-full flex flex-col"
    >
      {/* Mobile: Scrollable list, Desktop: Grid */}
      <div className="flex-1 min-h-0 w-full">
        <div className={`grid ${getGridCols()} gap-3 sm:gap-4 md:gap-5 w-full max-w-7xl mx-auto md:flex-1 md:min-h-0 md:auto-rows-fr px-2 md:px-4`}>
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.03,
                type: "spring",
                stiffness: 120,
              }}
              className="w-full"
            >
              <LearningStep
                step={step}
                index={index}
                isActive={activeStep === index}
                onClick={() => setActiveStep(index)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PlanStepsList;
