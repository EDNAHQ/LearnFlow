
import React from "react";
import { motion } from "framer-motion";

const HeroDecorations = () => {
  return (
    <>
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='smallGrid' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%236D42EF' stroke-width='0.5' opacity='0.3'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23smallGrid)'/%3e%3c/svg%3e")`,
          backgroundSize: '50px 50px',
          zIndex: 1
        }}
      />
      
      {/* Gradient blurs */}
      <div className="absolute -z-10 top-1/4 -right-10 w-40 h-40 rounded-full bg-brand-pink/20 blur-3xl"></div>
      <div className="absolute -z-10 -bottom-10 -left-10 w-48 h-48 rounded-full bg-brand-purple/20 blur-3xl"></div>
      
      {/* Floating particles */}
      <motion.div 
        className="absolute -right-4 top-10 w-4 h-4 rounded-full bg-brand-gold/40 z-10"
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
        className="absolute right-20 top-20 w-2 h-2 rounded-full bg-brand-purple/40 z-10"
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
        className="absolute left-10 bottom-10 w-3 h-3 rounded-full bg-brand-pink/40 z-10"
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
    </>
  );
};

export default HeroDecorations;
