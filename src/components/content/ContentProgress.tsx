
import { motion } from "framer-motion";

interface ContentProgressProps {
  topic: string;
  currentStep: number;
  totalSteps: number;
}

const ContentProgress = ({ topic, currentStep, totalSteps }: ContentProgressProps) => {
  return (
    <div className="w-full mb-8">
      <h1 className="text-3xl font-bold mb-3 text-gray-800 flex items-center gap-3 justify-between w-full">
        <span>{topic}</span>
        <div className="text-sm bg-[#6D42EF]/10 text-[#6D42EF] px-4 py-1.5 rounded-full font-semibold">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </h1>
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-[#6D42EF] h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ContentProgress;
