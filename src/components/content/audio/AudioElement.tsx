
import React from 'react';

interface AudioElementProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  onEnded: () => void;
  showControls: boolean;
}

const AudioElement: React.FC<AudioElementProps> = ({ 
  audioRef, 
  onEnded, 
  showControls 
}) => {
  return (
    <audio 
      ref={audioRef} 
      onEnded={onEnded}
      controls={showControls}
      className="w-full mt-2"
    />
  );
};

export default AudioElement;
