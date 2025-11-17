
import { Loader2, Sparkles } from "lucide-react";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";
import { BarLoader } from "@/components/ui/loader";
import { WaveFlow } from "@/components/ui/wave-flow";
import { useState, useEffect } from "react";

interface ContentLoaderProps {
  message?: string;
}

const ContentLoader = ({ message = "Generating concise content..." }: ContentLoaderProps) => {
  const [dots, setDots] = useState("");
  
  // Add animated dots to show activity
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={cn("relative flex flex-col items-center justify-center py-12 my-8 rounded-lg overflow-hidden", AI_STYLES.backgrounds.surface, AI_STYLES.borders.default)}>
      {/* Wave flow background animation */}
      <WaveFlow intensity="subtle" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className={cn("w-16 h-16 animate-spin mb-3", AI_STYLES.text.primary)} />
          <Sparkles className={cn("w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", AI_STYLES.text.accent)} />
        </div>
        <p className="text-gray-700 mt-4 text-lg font-medium">{message}{dots}</p>
        <p className="text-xs text-gray-500 mt-1">Creating focused learning content</p>
        <div className="w-64 mt-6">
          <BarLoader className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default ContentLoader;
