
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioSummaryPlayer from './AudioSummaryPlayer';

interface AudioModeDisplayProps {
  content?: string;
  title?: string;
  pathId?: string;
  stepId?: string;
  topic?: string;
}

const AudioModeDisplay: React.FC<AudioModeDisplayProps> = ({
  content,
  title,
  pathId = '',
  stepId = '',
  topic = ''
}) => {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Audio Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AudioSummaryPlayer pathId={pathId} topic={topic} />
      </CardContent>
    </Card>
  );
};

export default AudioModeDisplay;
