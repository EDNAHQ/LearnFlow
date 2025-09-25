
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import TextToSpeechPlayer from '@/components/audio/TextToSpeechPlayer';
import InteractiveVoiceOverlay from '@/components/audio/InteractiveVoiceOverlay';
import { motion } from 'framer-motion';
import { AI_STYLES } from '@/components/ai';
import { cn } from '@/lib/utils';

interface AudioSummaryPlayerProps {
  pathId: string;
  topic: string;
  content?: string;
  title?: string;
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({
  pathId,
  topic,
  content,
  title
}) => {
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

  // Generate a title for the audio based on the learning path topic
  const audioTitle = title ? `Audio: ${title}` : `Audio Summary: ${topic}`;

  // Use provided content or fallback
  const summary = content || "No content available for audio summary.";

  const initialPrompt = content 
    ? `This is the content: ${content.substring(0, 200)}... Continue reading this content.` 
    : `I'm learning about ${topic}. Can you give me a brief introduction?`;

  const handleVoiceMode = () => {
    setShowVoiceOverlay(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardHeader className="pb-4">
            <h3 className={cn("text-xl font-semibold mb-1", AI_STYLES.gradients.text)}>
              Interactive Audio Learning
            </h3>
            <p className="text-xs text-gray-500">
              AI-generated audio content for enhanced learning
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Text-to-Speech Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800">
                Listen to Content
              </h4>
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-primary/5 via-brand-accent/5 to-brand-highlight/5 border border-gray-200">
                <TextToSpeechPlayer
                  text={summary}
                  title={audioTitle}
                  pathId={pathId}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative h-px bg-gray-100">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
            </div>

            {/* Interactive Voice Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800">
                Interactive Conversation
              </h4>
              <motion.div
                onClick={handleVoiceMode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer rounded-xl p-6 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 border border-gray-200 hover:border-brand-primary/30 transition-all duration-300 hover:shadow-md"
              >
                <div className="text-center">
                  <h5 className={cn("text-lg font-semibold mb-2", AI_STYLES.gradients.text)}>
                    Voice Assistant
                  </h5>
                  <p className="text-sm text-gray-600">
                    Have a conversation about {topic}
                  </p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interactive Voice Overlay */}
      <InteractiveVoiceOverlay
        isOpen={showVoiceOverlay}
        onClose={() => setShowVoiceOverlay(false)}
        topic={topic}
        initialPrompt={initialPrompt}
        pathId={pathId}
        content={content}
      />
    </>
  );
};

export default AudioSummaryPlayer;
