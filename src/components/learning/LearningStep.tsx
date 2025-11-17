import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

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

// Available images in public/images folder
const AVAILABLE_IMAGES = [
  "/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_0 (1).png",
  "/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_0.png",
  "/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_3.png",
  "/images/sam.mckay.edna_Abstract_streams_of_glowing_lines_flowing_into_0943014d-588f-4ae4-bf32-7e8902c72d77_0.png",
  "/images/sam.mckay.edna_Circular_abstract_loop_of_arrows_where_text_vo_24773bac-3ac6-4957-b42f-bc404a5eb4d1_1.png",
  "/images/sam.mckay.edna_Floating_geometric_panels_with_glowing_icons_f_cd9121b1-2415-449c-9fd6-510878bd750a_0.png",
  "/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_1.png",
  "/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_2.png"
];

const LearningStep = ({
  step,
  index,
  isActive = false,
  onClick
}: LearningStepProps) => {
  // Deterministically select image based on index
  const imageUrl = useMemo(() => AVAILABLE_IMAGES[index % AVAILABLE_IMAGES.length], [index]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.03,
        type: "spring",
        stiffness: 150
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group overflow-hidden transition-all duration-300 cursor-pointer rounded-xl h-full flex flex-col shadow-md",
        isActive 
          ? "ring-2 ring-brand-purple shadow-lg shadow-brand-purple/30" 
          : "hover:shadow-lg"
      )}
      onClick={onClick}
    >
      {/* Card container - White background with image overlay */}
      <div className="relative overflow-hidden rounded-xl flex flex-col h-full bg-white border border-gray-200 shadow-sm">

        {/* Image section with dark overlay for text contrast */}
        <div className="relative h-24 sm:h-28 md:h-32 overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Dark overlay to ensure white text is visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

          {/* Step Number Overlay */}
          <motion.div
            animate={isActive ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 0.4 }}
            className="absolute top-2 left-2"
          >
            <div className={cn(
              "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 shadow-lg",
              isActive
                ? "bg-white text-brand-purple shadow-white/50 ring-2 ring-white"
                : "bg-white text-brand-purple shadow-black/20"
            )}>
              {index + 1}
            </div>
          </motion.div>

          {/* Active indicator */}
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-brand-purple shadow-lg shadow-brand-purple/50 ring-2 ring-white/50"
            />
          )}
        </div>

        {/* Content section - White background, dark text */}
        <div className="relative flex-1 p-3 sm:p-4 flex flex-col justify-between bg-white min-h-0">
          <div className="flex-1 min-h-0">
            {/* Title - Dark text, bold */}
            <h3 className={cn(
              "text-sm sm:text-base font-bold mb-1.5 sm:mb-2 transition-colors duration-300 line-clamp-2 leading-tight",
              isActive ? "text-gradient" : "text-brand-black"
            )}>
              {step.title}
            </h3>

            {/* Description - Dark gray text for readability */}
            <p className="text-xs sm:text-sm font-light leading-relaxed text-gray-700 line-clamp-3">
              {step.description}
            </p>
          </div>

          {/* Step indicator bar */}
          <div className="mt-2 h-0.5 rounded-full overflow-hidden bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isActive ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
              className="h-full brand-gradient"
            />
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl",
          "bg-gradient-to-br from-brand-purple/5 via-transparent to-brand-pink/5"
        )} />
      </div>
    </motion.div>
  );
};

export default LearningStep;
