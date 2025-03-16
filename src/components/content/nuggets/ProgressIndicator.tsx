
import React from "react";
import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  progress: number;
  generatingContent: boolean;
  generatedSteps: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  generatingContent,
  generatedSteps,
  totalSteps
}) => {
  const getProgressMessage = () => {
    if (!generatingContent && progress >= 100) {
      return "Content ready! You'll be redirected automatically.";
    }
    
    return `Generating content... ${Math.round(progress)}%`;
  };

  return (
    <>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#6D42EF] to-[#E84393]"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <p className="text-gray-600 text-sm mt-4">
        {getProgressMessage()}
      </p>
      
      {generatingContent && (
        <p className="text-gray-500 text-xs mt-2">
          Generated {generatedSteps} of {totalSteps} content pieces
        </p>
      )}
    </>
  );
};

export default ProgressIndicator;
