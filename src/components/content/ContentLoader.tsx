
import { Loader2 } from "lucide-react";

interface ContentLoaderProps {
  message?: string;
}

const ContentLoader = ({ message = "Content is being generated..." }: ContentLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-[#1A1A1A] rounded-lg border border-gray-800 shadow-sm">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin mb-4 text-[#6D42EF]" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{message}</h3>
      <p className="text-sm text-gray-400 max-w-md text-center">This should only take a few seconds.</p>
    </div>
  );
};

export default ContentLoader;
