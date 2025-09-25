
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeSpeech } from '@/hooks/realtime-speech';
import VoiceStatusDisplay from './VoiceStatusDisplay';
import VoiceControlsSection from './VoiceControlsSection';
import ConversationHistory from './ConversationHistory';

interface InteractiveVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: string;
  initialPrompt?: string;
  pathId?: string;
  content?: string;
}

const InteractiveVoiceOverlay: React.FC<InteractiveVoiceOverlayProps> = ({
  isOpen,
  onClose,
  topic = 'general knowledge',
  initialPrompt = '',
  pathId,
  content
}) => {
  const {
    isConnecting,
    isConnected,
    isSpeaking,
    isListening,
    status,
    messages,
    handleConnect,
    handleDisconnect,
    toggleListening
  } = useRealtimeSpeech({
    topic,
    initialPrompt,
    pathId,
    content
  });

  // Close overlay when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Disconnect when closing
  useEffect(() => {
    if (!isOpen && isConnected) {
      handleDisconnect();
    }
  }, [isOpen, isConnected, handleDisconnect]);

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      x: '100%'
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0,
      x: '100%',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.2, duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
        >
          {/* Background overlay */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Main content */}
          <motion.div 
            className="relative ml-auto w-full bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] flex flex-col"
            variants={overlayVariants}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <motion.div 
                className="flex items-center"
                variants={contentVariants}
              >
                {/* LearnFlow Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#6D42EF] to-[#E84393] rounded-lg flex items-center justify-center">
                    <div className="text-white font-bold text-lg">
                      <span className="text-white">L</span>
                      <span className="text-white">F</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    <span className="text-[#6D42EF]">Learn</span>
                    <span className="text-white">Flow</span>
                  </div>
                </div>
              </motion.div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Main Voice Interface */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <motion.div variants={contentVariants}>
                <VoiceStatusDisplay
                  isConnected={isConnected}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  topic={topic}
                />
                
                {/* Controls */}
                <div className="mt-8">
                  <VoiceControlsSection
                    isConnected={isConnected}
                    isConnecting={isConnecting}
                    isListening={isListening}
                    handleConnect={handleConnect}
                    handleDisconnect={handleDisconnect}
                    toggleListening={toggleListening}
                  />
                </div>
              </motion.div>
            </div>

            {/* Messages Section */}
            <ConversationHistory messages={messages} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveVoiceOverlay;
