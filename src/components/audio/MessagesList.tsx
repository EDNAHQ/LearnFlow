
import React from 'react';

interface Message {
  role: string;
  content: string;
}

interface MessagesListProps {
  messages: Message[];
  isSpeaking: boolean;
}

const MessagesList: React.FC<MessagesListProps> = ({ messages, isSpeaking }) => {
  return (
    <div className="flex flex-col space-y-4">
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`p-3 rounded-lg ${
            msg.role === 'user' 
              ? 'bg-gray-800 ml-10' 
              : 'bg-purple-900 mr-10'
          }`}
        >
          {msg.content}
        </div>
      ))}
      
      {!messages.length && (
        <div className="text-center text-gray-400 py-6">
          {"Start speaking or click the microphone button"}
        </div>
      )}
      
      {isSpeaking && (
        <div className="flex items-center justify-center space-x-1">
          <span className="bg-purple-600 h-3 w-1 animate-pulse rounded"></span>
          <span className="bg-purple-600 h-4 w-1 animate-pulse rounded delay-150"></span>
          <span className="bg-purple-600 h-6 w-1 animate-pulse rounded delay-300"></span>
          <span className="bg-purple-600 h-3 w-1 animate-pulse rounded delay-500"></span>
          <span className="ml-2">AI is speaking...</span>
        </div>
      )}
    </div>
  );
};

export default MessagesList;
