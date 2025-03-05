
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { generateStepContent } from "@/utils/learningUtils";
import { Loader2, FileText, Book } from "lucide-react";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
}

const ContentSection = ({ title, content, index, detailedContent }: ContentSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(detailedContent || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    // Update loaded content when detailed content prop changes
    if (detailedContent !== undefined) {
      setLoadedDetailedContent(detailedContent);
    }
  }, [detailedContent]);

  // Format the content with proper markdown-like rendering
  const formatContent = (text: string) => {
    const paragraphs = text.split("\n\n");
    
    return paragraphs.map((paragraph, i) => {
      // Check if this is a heading (starts with # or ##)
      if (paragraph.startsWith('# ')) {
        return (
          <h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-learn-800">
            {paragraph.replace('# ', '')}
          </h2>
        );
      } else if (paragraph.startsWith('## ')) {
        return (
          <h3 key={i} className="text-lg font-medium mt-5 mb-2 text-learn-700">
            {paragraph.replace('## ', '')}
          </h3>
        );
      } else if (paragraph.startsWith('- ')) {
        // Handle bullet points
        const listItems = paragraph.split('\n- ');
        return (
          <ul key={i} className="list-disc pl-5 mb-4 space-y-2">
            {listItems.map((item, j) => (
              <li key={`${i}-${j}`} className="text-pretty">
                {item.replace('- ', '')}
              </li>
            ))}
          </ul>
        );
      } else {
        return (
          <p key={i} className="mb-4 text-pretty">
            {paragraph}
          </p>
        );
      }
    });
  };

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-in-out bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {!loadedDetailedContent ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin mb-3 text-learn-500" />
            <Book className="w-5 h-5 text-learn-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 mt-4">Content is being generated in the background...</p>
          <p className="text-xs text-gray-400 mt-1">You can continue navigating through the steps</p>
        </div>
      ) : (
        <div className="prose prose-gray max-w-none">
          {formatContent(loadedDetailedContent)}
        </div>
      )}
    </div>
  );
};

export default ContentSection;
