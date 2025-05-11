
import { useState } from 'react';

export const useAudioControls = () => {
  const [showControls, setShowControls] = useState(true);

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  return {
    showControls,
    setShowControls,
    toggleControls
  };
};
