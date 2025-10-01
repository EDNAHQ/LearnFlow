import React from 'react';
import { motion } from 'framer-motion';

interface InfoCardProps {
  title: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mt-8 bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 rounded-xl p-6 border border-brand-primary/10"
    >
      <h4 className="font-semibold text-gray-900 mb-2">About Mental Models</h4>
      <p className="text-sm text-gray-600 leading-relaxed">
        These AI-generated images represent visual mental models for understanding{' '}
        <span className="font-medium text-gray-900">{title}</span>. Each image
        captures a key concept, helping you build intuitive understanding through
        visual learning.
      </p>
    </motion.div>
  );
};