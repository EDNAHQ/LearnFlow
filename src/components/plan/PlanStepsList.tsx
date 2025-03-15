
import { motion } from "framer-motion";
import LearningStep, { Step } from "@/components/LearningStep";

interface PlanStepsListProps {
  steps: Step[];
  activeStep: number | null;
  setActiveStep: (index: number) => void;
}

const PlanStepsList = ({ steps, activeStep, setActiveStep }: PlanStepsListProps) => {
  return (
    <div className="mb-10 space-y-3">
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
  );
};

export default PlanStepsList;
