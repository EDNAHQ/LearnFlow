
import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Mic } from 'lucide-react';

interface VoiceStatusDisplayProps {
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  topic: string;
}

const VoiceStatusDisplay: React.FC<VoiceStatusDisplayProps> = ({
  isConnected,
  isSpeaking,
  isListening,
  topic
}) => {
  return (
    <div className="text-center space-y-8">
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
    </div>
  );
};

export default VoiceStatusDisplay;
