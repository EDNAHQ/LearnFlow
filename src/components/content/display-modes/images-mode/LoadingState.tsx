import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/20" />
          <div className="h-2 w-32 mx-auto bg-gray-200 rounded" />
        </div>
        <p className="text-gray-500">Loading mental models...</p>
      </div>
    </div>
  );
};