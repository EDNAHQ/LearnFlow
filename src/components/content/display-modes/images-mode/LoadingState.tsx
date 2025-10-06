import React from 'react';
import AILoadingState from '@/components/ai/AILoadingState';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <AILoadingState variant="animated" message="Loading mental models..." />
    </div>
  );
};