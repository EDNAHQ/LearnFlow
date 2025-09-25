
import React, { useMemo } from 'react';
import AudioSummaryPlayer from '../AudioSummaryPlayer';
import { motion } from 'framer-motion';
import { AI_STYLES } from '@/components/ai';
import { cn } from '@/lib/utils';

interface AudioModeDisplayProps {
  content: string;
  title: string;
  pathId: string;
  stepId: string;
  topic: string;
}

const AudioModeDisplay: React.FC<AudioModeDisplayProps> = ({
  content,
  title,
  pathId,
  stepId,
  topic
}) => {
  // Clean up content for text-to-speech
  const cleanedContent = useMemo(() => {
    if (!content) return "";
    
    // If content is not a string, convert it
    const contentStr = typeof content === 'string' 
      ? content 
      : JSON.stringify(content);
    
    // Remove markdown and other formatting for better speech output
    return contentStr
      .replace(/#{1,6}\s/g, '') // Remove markdown headings
      .replace(/\*\*/g, '')     // Remove bold markers
      .replace(/\*/g, '')       // Remove italic markers
      .replace(/\n\n/g, '. ')   // Replace double newlines with period-space
      .replace(/\n/g, ' ')      // Replace newlines with spaces
      .trim();
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={cn("text-2xl font-bold mb-2", AI_STYLES.gradients.text)}>
          {title}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Listen to an AI-generated audio summary of the content
        </p>
      </motion.div>

      <AudioSummaryPlayer
        pathId={pathId}
        topic={topic}
        content={cleanedContent}
        title={title}
      />
    </motion.div>
  );
};

export default AudioModeDisplay;
