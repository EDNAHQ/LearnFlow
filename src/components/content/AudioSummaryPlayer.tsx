
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import TextToSpeechPlayer from '@/components/TextToSpeechPlayer';
import RealtimeSpeechPlayer from '@/components/audio/RealtimeSpeechPlayer';

interface AudioSummaryPlayerProps {
  pathId: string;
  topic: string;
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({ pathId, topic }) => {
  const { steps, isLoading } = useLearningSteps(pathId, topic);
  const [mode, setMode] = useState<'regular' | 'realtime'>('regular');

  // Generate a title for the audio based on the learning path topic
  const audioTitle = `Audio Summary: ${topic}`;

  // Create a summary of the learning path content
  const generateSummary = () => {
    if (!steps || steps.length === 0) {
      return "No content available for audio summary.";
    }
    
    return steps
      .map((step, index) => `Step ${index + 1}: ${step.title}. ${step.content}`)
      .join("\n\n");
  };

  const summary = generateSummary();
  const initialPrompt = `I'm learning about ${topic}. Can you give me a brief introduction?`;

  return (
    <Card className="bg-[#1A1A1A] border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-xl">Interactive Audio Learning</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="regular" onValueChange={(v) => setMode(v as 'regular' | 'realtime')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="regular">Text-to-Speech</TabsTrigger>
            <TabsTrigger value="realtime">Interactive Voice (AI)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regular">
            <TextToSpeechPlayer
              text={summary}
              title={audioTitle}
              pathId={pathId}
            />
          </TabsContent>
          
          <TabsContent value="realtime">
            <RealtimeSpeechPlayer
              topic={topic}
              initialPrompt={initialPrompt}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AudioSummaryPlayer;
