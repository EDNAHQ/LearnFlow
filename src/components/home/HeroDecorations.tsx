
import React from "react";
import { motion } from "framer-motion";

const HeroDecorations = () => {
  return (
    <>
      {/* Subtle gradient blurs */}
      <div className="absolute -z-10 top-1/3 right-0 w-60 h-60 rounded-full bg-brand-pink/4 blur-3xl"></div>
      <div className="absolute -z-10 bottom-0 left-0 w-72 h-72 rounded-full bg-brand-purple/4 blur-3xl"></div>
      
      {/* Minimal floating particles */}
      <motion.div 
        className="absolute right-1/4 top-1/4 w-3 h-3 rounded-full bg-brand-gold/15 z-10"
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
        className="absolute right-1/3 top-1/5 w-2 h-2 rounded-full bg-brand-purple/15 z-10"
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
      <motion.div 
        className="absolute left-1/4 bottom-1/4 w-2.5 h-2.5 rounded-full bg-brand-pink/15 z-10"
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Very subtle particles */}
      <motion.div 
        className="absolute left-2/3 top-2/3 w-4 h-4 rounded-full bg-brand-purple/15 z-10"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute right-1/2 bottom-1/3 w-1.5 h-1.5 rounded-full bg-brand-gold/15 z-10"
        animate={{
          y: [0, 12, 0],
          x: [0, -8, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </>
  );
};

export default HeroDecorations;
