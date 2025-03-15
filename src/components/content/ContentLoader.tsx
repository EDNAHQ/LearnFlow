
import { Loader2, Book } from "lucide-react";

interface ContentLoaderProps {
  message?: string;
}

const ContentLoader = ({ message = "Content is being generated..." }: ContentLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin mb-4 text-[#6D42EF]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-[#E84393] rounded-full opacity-25"></div>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{message}</h3>
      <p className="text-sm text-gray-500 mb-1 max-w-md text-center">This should only take a few seconds. If it takes longer, there might be an issue with our content generation service.</p>
      <p className="text-xs text-gray-400 max-w-md text-center">You can continue to explore other steps while this content loads.</p>
    </div>
  );
};

export default ContentLoader;
