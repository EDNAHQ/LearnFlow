
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
    <div className="flex justify-center gap-4">
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          size="lg"
          className="bg-gradient-to-r from-[#6D42EF] to-[#E84393] hover:from-[#5A35D1] hover:to-[#D63384] text-white px-8 py-4 rounded-full text-base font-medium shadow-lg"
        >
          {isConnecting ? 'Connecting...' : 'Start'}
        </Button>
      ) : (
        <>
          <Button
            onClick={toggleListening}
            size="icon"
            className={`w-16 h-16 rounded-full ${
              isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gradient-to-r from-[#6D42EF] to-[#E84393] hover:from-[#5A35D1] hover:to-[#D63384]'
            } text-white shadow-lg`}
          >
            {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </Button>

          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full px-6"
          >
            End
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceControlsSection;
