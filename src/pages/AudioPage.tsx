
import React, { useState } from "react";
import { MainNav } from "@/components/navigation";
import { motion } from "framer-motion";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AudioPageHeader } from "@/components/audio-page/AudioPageHeader";
import { AudioCard } from "@/components/audio-page/AudioCard";

const AudioPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const { generateSpeech } = useTextToSpeech();

  const generateProjectSummary = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // This is a sample summary text. In a real implementation, 
      // you would generate this dynamically based on the project content
      const summaryText = 
        "Welcome to LearnFlow, your AI-powered learning platform. " +
        "LearnFlow creates personalized learning paths tailored to your interests and goals. " +
        "With features like text-to-speech, podcast creation, and interactive presentations, " +
        "LearnFlow makes learning engaging and accessible. " +
        "Our AI technology breaks down complex topics into manageable steps, " +
        "ensuring you understand each concept before moving on. " +
        "Whether you're learning coding, business strategies, or creative skills, " +
        "LearnFlow adapts to your learning style and pace. " +
        "Start your learning journey today with LearnFlow.";
      
      // Generate a unique dummy pathId for this audio since it's not tied to a specific learning path
      const dummyPathId = `audio_page_${Date.now()}`;
      
      // Make sure to pass both text and pathId parameters
      const url = await generateSpeech(summaryText, dummyPathId);
      
      if (url) {
        setAudioUrl(url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate project summary audio");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Failed to play audio:", err);
          setError("Failed to play audio. Please try again.");
        });
      }
    }
  };

  // Handle audio events
  React.useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error("Audio element error:", e);
      setError("Error playing audio. Please try again.");
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AudioPageHeader 
            title="Project Audio Summary" 
            description="Listen to an AI-generated audio summary of your entire project."
          />
          
          <AudioCard 
            audioUrl={audioUrl}
            isGenerating={isGenerating}
            isPlaying={isPlaying}
            error={error}
            audioRef={audioRef}
            onGenerateAudio={generateProjectSummary}
            onTogglePlayPause={togglePlayPause}
            onGenerateNew={generateProjectSummary}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default AudioPage;
