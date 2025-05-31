
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface VoiceControlsSectionProps {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  handleConnect: () => void;
  handleDisconnect: () => void;
  toggleListening: () => void;
}

const VoiceControlsSection: React.FC<VoiceControlsSectionProps> = ({
  isConnected,
  isConnecting,
  isListening,
  handleConnect,
  handleDisconnect,
  toggleListening
}) => {
  return (
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
  );
};

export default VoiceControlsSection;
