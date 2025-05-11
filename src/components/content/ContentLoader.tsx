
import { Loader2, Book } from "lucide-react";
import { BarLoader } from "@/components/ui/loader";
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
    <div className="flex flex-col items-center justify-center py-12 my-8 border border-[#6D42EF]/20 rounded-lg bg-[#6D42EF]/5">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin mb-3 text-[#6D42EF]" />
        <Book className="w-6 h-6 text-[#E84393] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-gray-700 mt-4 text-lg font-medium">{message}{dots}</p>
      <p className="text-xs text-gray-500 mt-1">Creating focused learning content</p>
      <div className="w-64 mt-6">
        <BarLoader className="w-full" />
      </div>
    </div>
  );
};

export default ContentLoader;
