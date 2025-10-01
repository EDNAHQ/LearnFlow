
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
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black/90 to-pink-900/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Close button - fixed top right, outside content */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="fixed top-8 right-8 text-white bg-red-600/90 hover:bg-red-500 z-[100] rounded-full shadow-2xl border-2 border-white/30 w-12 h-12"
          >
            <X className="w-7 h-7" />
          </Button>

          {/* Main content */}
          <motion.div
            className="relative ml-auto w-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col"
            variants={overlayVariants}
          >

            {/* Main Voice Interface - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <motion.div variants={contentVariants} className="flex flex-col items-center">
                <VoiceStatusDisplay
                  isConnected={isConnected}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  topic={topic}
                />

                {/* Controls */}
                <div className="mt-12">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveVoiceOverlay;
