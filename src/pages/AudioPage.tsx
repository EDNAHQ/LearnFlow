
import React, { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Headphones, Play, Pause, Loader2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { BarLoader } from "@/components/ui/loader";

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
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Project Audio Summary
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Listen to an AI-generated audio summary of your entire project.
            </p>
          </div>
          
          <Card className="bg-white shadow-lg max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-brand-purple" />
                Project Overview Audio
              </CardTitle>
              <CardDescription>
                Generate and listen to an audio version of your project summary
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                {!audioUrl ? (
                  <div className="flex flex-col items-center py-8">
                    <Headphones className="h-16 w-16 text-brand-purple mb-4" />
                    <p className="text-center mb-4">
                      Generate an audio summary of your project to listen on the go
                    </p>
                    <Button 
                      onClick={generateProjectSummary}
                      disabled={isGenerating}
                      className="bg-brand-purple hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Audio...
                        </>
                      ) : (
                        <>Generate Audio Summary</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button 
                        onClick={togglePlayPause}
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-brand-purple"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6 text-brand-purple" />
                        ) : (
                          <Play className="h-6 w-6 ml-1 text-brand-purple" />
                        )}
                      </Button>
                      
                      <div className="text-lg font-medium">
                        {isPlaying ? "Playing..." : "Ready to play"}
                      </div>
                    </div>
                    
                    <audio 
                      ref={audioRef} 
                      src={audioUrl} 
                      controls 
                      className="w-full"
                      onError={() => setError("Error loading audio")}
                    />
                  </div>
                )}
                
                {isGenerating && <BarLoader className="mt-4" />}
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-md">
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              {audioUrl && (
                <Button
                  variant="ghost"
                  onClick={generateProjectSummary}
                  disabled={isGenerating}
                >
                  Generate New Summary
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AudioPage;
