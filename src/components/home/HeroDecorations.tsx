
import React from "react";
import { motion } from "framer-motion";

const HeroDecorations = () => {
  return (
    <>
      {/* Background grid pattern - adjusted to be more subtle */}
      <div 
        className="absolute inset-0 w-full h-full opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='smallGrid' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%236D42EF' stroke-width='0.5' opacity='0.3'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23smallGrid)'/%3e%3c/svg%3e")`,
          backgroundSize: '50px 50px',
          zIndex: 1
        }}
      />
      
      {/* Gradient blurs - repositioned to not conflict with floating paths */}
      <div className="absolute -z-10 top-1/3 right-0 w-40 h-40 rounded-full bg-brand-pink/15 blur-3xl"></div>
      <div className="absolute -z-10 bottom-0 left-0 w-48 h-48 rounded-full bg-brand-purple/15 blur-3xl"></div>
      
      {/* Additional floating particles to complement the paths */}
      <motion.div 
        className="absolute right-1/4 top-1/4 w-4 h-4 rounded-full bg-brand-gold/40 z-10"
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
        className="absolute right-1/3 top-1/5 w-2 h-2 rounded-full bg-brand-purple/40 z-10"
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
        className="absolute left-1/4 bottom-1/4 w-3 h-3 rounded-full bg-brand-pink/40 z-10"
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
      
      {/* Add a few more particles to enhance the effect */}
      <motion.div 
        className="absolute left-2/3 top-2/3 w-5 h-5 rounded-full bg-brand-purple/30 z-10"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute right-1/2 bottom-1/3 w-2 h-2 rounded-full bg-brand-gold/30 z-10"
        animate={{
          y: [0, 12, 0],
          x: [0, -8, 0],
          opacity: [0.2, 0.6, 0.2],
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
