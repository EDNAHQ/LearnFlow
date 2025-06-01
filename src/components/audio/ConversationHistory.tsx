
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationHistoryProps {
  messages: Message[];
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.2, duration: 0.3 }
    }
  };

  return (
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
  );
};

export default ConversationHistory;
