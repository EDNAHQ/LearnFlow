
import { Loader2, Book } from "lucide-react";
import { BarLoader } from "@/components/ui/loader";

interface ContentLoaderProps {
  message?: string;
}

const ContentLoader = ({ message = "Content is being generated..." }: ContentLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin mb-3 text-[#6D42EF]" />
        <Book className="w-5 h-5 text-[#E84393] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-gray-500 mt-4">{message}</p>
      <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
      <div className="w-48 mt-4">
        <BarLoader className="w-full" />
      </div>
    </div>
  );
};

export default ContentLoader;
