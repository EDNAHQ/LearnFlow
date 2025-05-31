
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeSpeech } from '@/hooks/useRealtimeSpeech';
import { Card, CardContent } from '@/components/ui/card';

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
              <motion.h2 
                className="text-2xl font-bold text-white"
                variants={contentVariants}
              >
                AI Voice Assistant
              </motion.h2>
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
              <motion.div
                className="text-center space-y-8"
                variants={contentVariants}
              >
                {/* Voice Visual with LearnFlow Logo */}
                <div className="relative">
                  <motion.div
                    className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-500 ${
                      isSpeaking 
                        ? 'bg-gradient-to-r from-[#6D42EF] to-[#E84393] shadow-lg shadow-purple-500/30' 
                        : isListening 
                        ? 'bg-gradient-to-r from-[#E84393] to-[#F5B623] shadow-lg shadow-pink-500/30'
                        : 'bg-gray-800 border-2 border-gray-600'
                    }`}
                    animate={isSpeaking || isListening ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {isSpeaking ? (
                      <Volume2 className="w-12 h-12 text-white" />
                    ) : isListening ? (
                      <Mic className="w-12 h-12 text-white" />
                    ) : (
                      // LearnFlow Logo
                      <div className="text-white font-bold text-lg tracking-wider">
                        <div className="flex items-center justify-center">
                          <span className="text-[#6D42EF]">L</span>
                          <span>F</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Pulse effect when speaking */}
                  {isSpeaking && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-purple-500/50"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </div>

                {/* Status Text */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {!isConnected ? 'Ready to Chat' : 
                     isSpeaking ? 'AI is Speaking...' :
                     isListening ? 'Listening...' : 'Connected'}
                  </h3>
                  <p className="text-gray-400">
                    {!isConnected ? `Talk about ${topic}` :
                     isSpeaking ? 'The AI is responding to your question' :
                     isListening ? 'Speak now, I\'m listening' : 'Press the microphone to start talking'}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  {!isConnected ? (
                    <Button 
                      onClick={handleConnect}
                      disabled={isConnecting}
                      size="lg"
                      className="bg-gradient-to-r from-[#6D42EF] to-[#E84393] hover:from-[#5A35D1] hover:to-[#D63384] text-white px-8 py-3"
                    >
                      {isConnecting ? 'Connecting...' : 'Start Conversation'}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={toggleListening}
                        size="lg"
                        variant={isListening ? "destructive" : "secondary"}
                        className={isListening ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="mr-2 h-5 w-5" />
                            Stop Listening
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2 h-5 w-5" />
                            Start Talking
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={handleDisconnect}
                        variant="outline"
                        size="lg"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        End Chat
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Messages Section */}
            {messages.length > 0 && (
              <motion.div 
                className="h-80 overflow-hidden border-t border-gray-700"
                variants={contentVariants}
              >
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Conversation</h4>
                  <div className="space-y-3 h-60 overflow-y-auto">
                    {messages.map((message, index) => (
                      <Card key={index} className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-2">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                            <div className="flex-1">
                              <div className="text-xs text-gray-400 mb-1">
                                {message.role === 'user' ? 'You' : 'AI Assistant'}
                              </div>
                              <div className="text-sm text-white">{message.content}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveVoiceOverlay;
