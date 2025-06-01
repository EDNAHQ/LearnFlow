
import React, { useMemo } from 'react';
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
  // Clean up content for text-to-speech
  const cleanedContent = useMemo(() => {
    if (!content) return "";
    
    // If content is not a string, convert it
    const contentStr = typeof content === 'string' 
      ? content 
      : JSON.stringify(content);
    
    // Remove markdown and other formatting for better speech output
    return contentStr
      .replace(/#{1,6}\s/g, '') // Remove markdown headings
      .replace(/\*\*/g, '')     // Remove bold markers
      .replace(/\*/g, '')       // Remove italic markers
      .replace(/\n\n/g, '. ')   // Replace double newlines with period-space
      .replace(/\n/g, ' ')      // Replace newlines with spaces
      .trim();
  }, [content]);

  return (
    <div className="bg-white shadow-md rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{title} - Audio Summary</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Listen to an audio summary of the content. Our AI has processed this content
          into an easy-to-follow audio format.
        </p>
        <AudioSummaryPlayer 
          pathId={pathId} 
          topic={topic} 
          content={cleanedContent}
          title={title}
        />
      </div>
    </div>
  );
};

export default AudioModeDisplay;
