
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RealtimeSpeechStatusProps {
  status: string;
  isConnected: boolean;
}

const RealtimeSpeechStatus: React.FC<RealtimeSpeechStatusProps> = ({ status, isConnected }) => {
  return (
    <Badge 
      variant={isConnected ? "outline" : "secondary"}
      className={isConnected ? "border-green-500 bg-green-500/10 text-green-500" : "bg-gray-600"}
    >
      {status}
    </Badge>
  );
};

export default RealtimeSpeechStatus;
