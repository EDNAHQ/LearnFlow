
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
    <div className="text-center">
      {/* Voice Visual - Larger and centered */}
      <div className="relative mb-8">
        <motion.div
          className={`w-40 h-40 rounded-full mx-auto flex items-center justify-center transition-all duration-500 ${
            isSpeaking
              ? 'bg-gradient-to-br from-[#6D42EF] via-purple-600 to-[#E84393] shadow-2xl shadow-purple-500/50'
              : isListening
              ? 'bg-gradient-to-br from-[#E84393] via-pink-600 to-[#F5B623] shadow-2xl shadow-pink-500/50'
              : 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-purple-500/30'
          }`}
          animate={isSpeaking || isListening ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {isSpeaking ? (
            <Volume2 className="w-16 h-16 text-white" />
          ) : isListening ? (
            <Mic className="w-16 h-16 text-white" />
          ) : (
            <div className="text-white font-bold text-3xl tracking-wider">
              <div className="flex items-center justify-center">
                <span className="text-purple-400">L</span>
                <span>F</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Pulse effect */}
        {(isSpeaking || isListening) && (
          <>
            <motion.div
              className={`absolute inset-0 rounded-full border-2 ${isSpeaking ? 'border-purple-500/50' : 'border-pink-500/50'}`}
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.div
              className={`absolute inset-0 rounded-full border-2 ${isSpeaking ? 'border-purple-400/30' : 'border-pink-400/30'}`}
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
            />
          </>
        )}
      </div>

      {/* Status Text - Minimal */}
      {isConnected && (
        <p className="text-lg text-gray-300">
          {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready'}
        </p>
      )}
    </div>
  );
};

export default VoiceStatusDisplay;
