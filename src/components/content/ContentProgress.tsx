
import React from "react";
import StepPagination from "./StepPagination";

interface ContentProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ id: string; title: string }>;
  onNavigate: (index: number) => void;
}

const ContentProgress = ({
  currentStep,
  totalSteps,
  steps,
  onNavigate
}: ContentProgressProps) => {
  if (totalSteps <= 0) return null;

  return (
    <div className="w-full mb-6">
      <StepPagination
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={steps}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default ContentProgress;
