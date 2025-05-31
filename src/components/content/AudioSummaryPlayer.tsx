
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import TextToSpeechPlayer from '@/components/TextToSpeechPlayer';
import InteractiveVoiceOverlay from '@/components/audio/InteractiveVoiceOverlay';
import { Info, Headphones, MessageCircle } from 'lucide-react';

interface AudioSummaryPlayerProps {
  pathId: string;
  topic: string;
  content?: string;
  title?: string;
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({ 
  pathId, 
  topic,
  content,
  title
}) => {
  const { steps, isLoading } = useLearningSteps(pathId, topic);
  const [mode, setMode] = useState<'regular' | 'realtime'>('regular');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [summary, setSummary] = useState<string>("");
  
  // Generate a title for the audio based on the learning path topic
  const audioTitle = title ? `Audio: ${title}` : `Audio Summary: ${topic}`;

  // Create a summary of the learning path content or use provided content
  useEffect(() => {
    if (content) {
      setSummary(content);
      return;
    }
    
    if (!steps || steps.length === 0) {
      setSummary("No content available for audio summary.");
      return;
    }
    
    const generatedSummary = steps
      .map((step, index) => `Step ${index + 1}: ${step.title}. ${step.content}`)
      .join("\n\n");
    
    setSummary(generatedSummary);
  }, [steps, content]);

  const initialPrompt = content 
    ? `This is the content: ${content.substring(0, 200)}... Continue reading this content.` 
    : `I'm learning about ${topic}. Can you give me a brief introduction?`;

  const handleVoiceMode = () => {
    setShowVoiceOverlay(true);
  };

  return (
    <>
      <Card className="bg-[#1A1A1A] border-gray-700 text-white overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#6D42EF]" />
            Interactive Audio Learning
          </CardTitle>
          <div className="text-xs text-gray-400 flex items-center">
            <Info className="w-3 h-3 mr-1" /> 
            <span>AI-generated audio content. Voices are not from real humans.</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text-to-Speech Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Headphones className="w-4 h-4" />
              Listen to Content
            </div>
            <TextToSpeechPlayer
              text={summary}
              title={audioTitle}
              pathId={pathId}
            />
          </div>

          {/* Interactive Voice Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <MessageCircle className="w-4 h-4" />
              Interactive AI Conversation
            </div>
            <div 
              onClick={handleVoiceMode}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#6D42EF] to-[#E84393] p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="relative z-10 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-3 text-white" />
                <h3 className="text-lg font-semibold text-white mb-2">Voice Assistant</h3>
                <p className="text-purple-100 text-sm">
                  Have a conversation about {topic}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Voice Overlay */}
      <InteractiveVoiceOverlay
        isOpen={showVoiceOverlay}
        onClose={() => setShowVoiceOverlay(false)}
        topic={topic}
        initialPrompt={initialPrompt}
        pathId={pathId}
        content={content}
      />
    </>
  );
};

export default AudioSummaryPlayer;
