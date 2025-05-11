
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioSummaryPlayer from './AudioSummaryPlayer';

interface AudioModeDisplayProps {
  content: string;
  title: string;
  pathId: string;
  stepId: string;
  topic: string;
}

const AudioModeDisplay: React.FC<AudioModeDisplayProps> = ({
  content,
  title,
  pathId,
  stepId,
  topic
}) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{title} - Audio Summary</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Listen to an audio summary of the entire project. Our AI has condensed all the key concepts
          into an easy-to-follow audio format.
        </p>
        <AudioSummaryPlayer pathId={pathId} topic={topic} />
      </div>
    </div>
  );
};

export default AudioModeDisplay;
