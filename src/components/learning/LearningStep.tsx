import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, CheckCircle } from "lucide-react";

export interface Step {
  id: string;
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
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group overflow-hidden transition-all duration-500 cursor-pointer",
        isActive
          ? "scale-[1.02]"
          : "hover:scale-[1.01]"
      )}
      onClick={onClick}
    >
      {/* Background gradient effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isActive && "opacity-100"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5]/5 via-[#ca5a8b]/5 to-[#f2b347]/5" />
      </div>

      {/* Main card */}
      <div className={cn(
        "relative bg-white rounded-2xl p-6 transition-all duration-500 border-2",
        isActive
          ? "border-[#6654f5]/30 shadow-xl shadow-[#6654f5]/10"
          : "border-gray-100 hover:border-[#6654f5]/20 hover:shadow-lg hover:shadow-gray-200/50"
      )}>
        <div className="flex items-start gap-5">
          {/* Step number with gradient background */}
          <motion.div
            animate={isActive ? {
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.6 }}
            className="relative flex-shrink-0"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-500",
              isActive
                ? "brand-gradient text-white shadow-lg shadow-[#6654f5]/30"
                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-[#6654f5]/10 group-hover:to-[#ca5a8b]/10 group-hover:text-[#6654f5]"
            )}>
              {index + 1}
            </div>
            {isActive && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-4 w-4 text-[#f2b347]" />
              </motion.div>
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <h3 className={cn(
              "text-lg font-semibold mb-2 flex items-center gap-2 transition-colors duration-300",
              isActive
                ? "text-[#6654f5]"
                : "text-[#0b0c18] group-hover:text-[#6654f5]"
            )}>
              {step.title}
              {isActive && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="h-5 w-5 text-[#6654f5]" />
                </motion.div>
              )}
            </h3>
            <p className={cn(
              "text-sm leading-relaxed transition-colors duration-300",
              isActive ? "text-gray-700" : "text-gray-600"
            )}>
              {step.description}
            </p>
          </div>

          {/* Chevron indicator */}
          <motion.div
            animate={isActive ? { x: 5 } : { x: 0 }}
            className={cn(
              "flex-shrink-0 transition-all duration-300 opacity-0 group-hover:opacity-100",
              isActive && "opacity-100"
            )}
          >
            <ChevronRight className={cn(
              "w-5 h-5 transition-colors duration-300",
              isActive ? "text-[#6654f5]" : "text-gray-400"
            )} />
          </motion.div>
        </div>

        {/* Progress line for active step */}
        {isActive && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-0 left-0 h-1 brand-gradient"
          />
        )}
      </div>
    </motion.div>
  );
};

export default LearningStep;


