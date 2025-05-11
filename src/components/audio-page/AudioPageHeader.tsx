
import React from "react";
import { motion } from "framer-motion";

interface AudioPageHeaderProps {
  title: string;
  description: string;
}

export const AudioPageHeader: React.FC<AudioPageHeaderProps> = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-10"
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
        {title}
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        {description}
      </p>
    </motion.div>
  );
};
