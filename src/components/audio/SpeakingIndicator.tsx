
import React from 'react';

const SpeakingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <span className="bg-purple-600 h-3 w-1 animate-pulse rounded"></span>
      <span className="bg-purple-600 h-4 w-1 animate-pulse rounded delay-150"></span>
      <span className="bg-purple-600 h-6 w-1 animate-pulse rounded delay-300"></span>
      <span className="bg-purple-600 h-3 w-1 animate-pulse rounded delay-500"></span>
      <span className="ml-2">AI is speaking...</span>
    </div>
  );
};

export default SpeakingIndicator;
