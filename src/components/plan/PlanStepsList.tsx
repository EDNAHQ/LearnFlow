
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
      className="mb-16"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-[#0b0c18] mb-3">Your Learning Journey</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Click on any step below to explore its details and begin your mastery
        </p>
      </motion.div>

      {/* Steps list - centered with max width */}
      <div className="max-w-5xl mx-auto space-y-6">
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
