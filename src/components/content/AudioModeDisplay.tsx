
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioSummaryPlayer from '@/components/content/audio/AudioSummaryPlayer';

interface AudioModeDisplayProps {
  pathId: string;
  stepId: string;
  topic: string;
  // These props are unused but kept for consistent interface with other mode displays
  content?: string;
  title?: string;
}

const AudioModeDisplay: React.FC<AudioModeDisplayProps> = ({
  pathId,
  stepId,
  topic
}) => {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Audio Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AudioSummaryPlayer pathId={pathId} stepId={stepId} topic={topic} />
      </CardContent>
    </Card>
  );
};

export default AudioModeDisplay;
