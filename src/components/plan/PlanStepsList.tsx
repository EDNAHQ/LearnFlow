
import { motion } from "framer-motion";
import LearningStep, { Step } from "@/components/learning/LearningStep";

interface PlanStepsListProps {
  steps: Step[];
  activeStep: number | null;
  setActiveStep: (index: number) => void;
}

const PlanStepsList = ({ steps, activeStep, setActiveStep }: PlanStepsListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-10 space-y-4"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-semibold text-[#0b0c18] mb-2">Your Learning Steps</h2>
        <p className="text-gray-600">Click on any step to explore its details</p>
      </motion.div>

      {/* Steps list */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <LearningStep
            key={step.id}
            step={step}
            index={index}
            isActive={activeStep === index}
            onClick={() => setActiveStep(index)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PlanStepsList;
