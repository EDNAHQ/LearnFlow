
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Music } from "lucide-react";

const PodcastModeDisplay: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 w-full max-w-[860px] mx-auto">
      <div className="text-center py-8">
        <Music className="h-16 w-16 mx-auto text-[#6D42EF] opacity-70 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We're enhancing our AI Podcast Creator to deliver a more reliable and feature-rich experience. 
          Check back soon to create engaging podcast conversations between AI hosts.
        </p>
        
        <Alert className="bg-[#6D42EF]/10 border-[#6D42EF] text-left max-w-2xl mx-auto">
          <AlertTitle className="text-[#6D42EF]">Under Development</AlertTitle>
          <AlertDescription className="text-gray-700">
            Our team is working on integrating improved AI models and audio generation capabilities. 
            We appreciate your patience as we build something amazing for you!
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default PodcastModeDisplay;
