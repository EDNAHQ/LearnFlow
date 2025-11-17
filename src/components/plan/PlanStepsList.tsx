import { motion } from "framer-motion";
import LearningStep, { Step } from "@/components/learning/LearningStep";

interface PlanStepsListProps {
  steps: Step[];
  activeStep: number | null;
  setActiveStep: (index: number) => void;
}

const PlanStepsList = ({ steps, activeStep, setActiveStep }: PlanStepsListProps) => {
  // Always use 5 columns for desktop, 2 for mobile/tablet
  const getGridCols = () => {
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full h-full flex flex-col"
    >
      {/* Section header - Very compact */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mb-3 sm:mb-4 flex-shrink-0"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black mb-1">
          Your Learning Journey
        </h2>
      </motion.div>

      {/* Grid container - 5 columns, fills space */}
      <div className={`grid ${getGridCols()} gap-3 sm:gap-4 w-full max-w-7xl mx-auto flex-1 min-h-0 auto-rows-fr px-2`}>
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
            className="w-full min-h-0"
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
    </motion.div>
  );
};

export default PlanStepsList;
