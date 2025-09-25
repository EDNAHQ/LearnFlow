
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeSpeech } from '@/hooks/realtime-speech';
import RealtimeSpeechStatus from './RealtimeSpeechStatus';
import MessagesList from './MessagesList';
import RealtimeSpeechControls from './RealtimeSpeechControls';

interface RealtimeSpeechPlayerProps {
  topic?: string;
  initialPrompt?: string;
  pathId?: string;
  content?: string;
}

const RealtimeSpeechPlayer: React.FC<RealtimeSpeechPlayerProps> = ({ 
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

  return (
    <Card className="w-full bg-[#1A1A1A] text-white border border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          AI Voice Assistant
        </CardTitle>
        <RealtimeSpeechStatus status={status} isConnected={isConnected} />
      </CardHeader>
      <CardContent className="space-y-4">
        <MessagesList messages={messages} isSpeaking={isSpeaking} />
        
        <RealtimeSpeechControls
          isConnected={isConnected}
          isConnecting={isConnecting}
          isListening={isListening}
          handleConnect={handleConnect}
          handleDisconnect={handleDisconnect}
          toggleListening={toggleListening}
        />
      </CardContent>
    </Card>
  );
};

export default RealtimeSpeechPlayer;
