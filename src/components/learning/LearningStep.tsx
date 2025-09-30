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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 80
      }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group overflow-hidden transition-all duration-500 cursor-pointer rounded-2xl w-3/4 mx-auto",
        isActive ? "ring-4 ring-[#6654f5]/50 shadow-2xl shadow-[#6654f5]/30" : "hover:shadow-2xl hover:shadow-gray-300/50"
      )}
      onClick={onClick}
    >
      {/* Card container - Image left 25%, Content right 75% */}
      <div className="relative overflow-hidden rounded-2xl flex min-h-[165px] bg-white">

        {/* Left Image (25%) with overlaid number */}
        <div className="relative w-1/4 overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/30" />

          {/* Step Number Overlay on Image */}
          <motion.div
            animate={isActive ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 0.6 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl font-bold text-xl transition-all duration-500 shadow-xl",
              isActive
                ? "bg-white text-[#6654f5] shadow-white/50 ring-2 ring-white"
                : "bg-white/90 backdrop-blur-sm text-[#6654f5] shadow-black/30"
            )}>
              {index + 1}
            </div>
          </motion.div>
        </div>

        {/* Right Content (75%) */}
        <div className="relative flex-1 p-6 flex items-center bg-white">
          <div className="w-full">
            {/* Title */}
            <h3 className={cn(
              "text-lg font-bold mb-2 transition-colors duration-300",
              isActive ? "text-[#6654f5]" : "text-[#0b0c18] group-hover:text-[#6654f5]"
            )}>
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-600">
              {step.description}
            </p>
          </div>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#6654f5] shadow-lg shadow-[#6654f5]/50 ring-4 ring-white"
          />
        )}

        {/* Hover Glow Effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-br from-[#6654f5]/5 via-transparent to-[#ca5a8b]/5"
        )} />
      </div>
    </motion.div>
  );
};

export default LearningStep;


