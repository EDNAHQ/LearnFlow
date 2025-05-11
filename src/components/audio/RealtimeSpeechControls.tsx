
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Mic, MicOff, Square } from 'lucide-react';

interface RealtimeSpeechControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  handleConnect: () => Promise<void>;
  handleDisconnect: () => void;
  toggleListening: () => void;
}

const RealtimeSpeechControls: React.FC<RealtimeSpeechControlsProps> = ({
  isConnected,
  isConnecting,
  isListening,
  handleConnect,
  handleDisconnect,
  toggleListening
}) => {
  return (
    <div className="flex justify-center space-x-4 pt-4">
      {!isConnected ? (
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="bg-purple-700 hover:bg-purple-600"
        >
          {isConnecting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect to Voice Assistant"
          )}
        </Button>
      ) : (
        <>
          <Button 
            onClick={toggleListening} 
            variant={isListening ? "destructive" : "secondary"}
            className={isListening ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Listening
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDisconnect}
            variant="outline"
            className="border-gray-600"
          >
            <Square className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </>
      )}
    </div>
  );
};

export default RealtimeSpeechControls;
