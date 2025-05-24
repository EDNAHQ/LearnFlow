
import React from "react";
import { motion } from "framer-motion";

const HeroDecorations = () => {
  return (
    <>
      {/* Very subtle gradient blurs */}
      <div className="absolute -z-10 top-1/3 right-0 w-60 h-60 rounded-full bg-brand-purple/2 blur-3xl"></div>
      <div className="absolute -z-10 bottom-0 left-0 w-72 h-72 rounded-full bg-brand-pink/2 blur-3xl"></div>
      
      {/* Minimal floating particles with reduced visibility */}
      <motion.div 
        className="absolute right-1/4 top-1/4 w-2 h-2 rounded-full bg-brand-gold/10 z-10"
        animate={{
          y: [0, 15, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute right-1/3 top-1/5 w-1.5 h-1.5 rounded-full bg-brand-purple/10 z-10"
        animate={{
          y: [0, -10, 0],
          x: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </>
  );
};

export default HeroDecorations;
