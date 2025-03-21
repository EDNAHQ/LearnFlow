
import React from "react";
import { motion } from "framer-motion";

const HeroDecorations = () => {
  return (
    <>
      {/* Extremely subtle gradient blurs that won't block animations */}
      <div className="absolute -z-10 top-1/3 right-0 w-40 h-40 rounded-full bg-brand-pink/5 blur-3xl"></div>
      <div className="absolute -z-10 bottom-0 left-0 w-48 h-48 rounded-full bg-brand-purple/5 blur-3xl"></div>
      
      {/* Minimal floating particles that complement but don't overpower the paths */}
      <motion.div 
        className="absolute right-1/4 top-1/4 w-4 h-4 rounded-full bg-brand-gold/20 z-10"
        animate={{
          y: [0, 15, 0],
          x: [0, 5, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute right-1/3 top-1/5 w-2 h-2 rounded-full bg-brand-purple/20 z-10"
        animate={{
          y: [0, -10, 0],
          x: [0, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute left-1/4 bottom-1/4 w-3 h-3 rounded-full bg-brand-pink/20 z-10"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Very subtle particles */}
      <motion.div 
        className="absolute left-2/3 top-2/3 w-5 h-5 rounded-full bg-brand-purple/20 z-10"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute right-1/2 bottom-1/3 w-2 h-2 rounded-full bg-brand-gold/20 z-10"
        animate={{
          y: [0, 12, 0],
          x: [0, -8, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </>
  );
};

export default HeroDecorations;
