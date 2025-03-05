
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { generateStepContent } from "@/utils/learningUtils";
import { Loader2, FileText } from "lucide-react";

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
          <h2 key={i} className="text-xl font-semibold mt-6 mb-3">
            {paragraph.replace('# ', '')}
          </h2>
        );
      } else if (paragraph.startsWith('## ')) {
        return (
          <h3 key={i} className="text-lg font-medium mt-5 mb-2">
            {paragraph.replace('## ', '')}
          </h3>
        );
      } else if (paragraph.startsWith('- ')) {
        // Handle bullet points
        const listItems = paragraph.split('\n- ');
        return (
          <ul key={i} className="list-disc pl-5 mb-4 space-y-1">
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
        "transition-all duration-500 ease-in-out glass-panel p-6 mb-8",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-full bg-learn-100 flex items-center justify-center text-learn-700 font-medium mr-3">
          {index + 1}
        </div>
        <h2 className="text-xl font-medium">{title}</h2>
      </div>
      
      <div className="prose prose-gray max-w-none">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-learn-500" />
            <p className="text-gray-400">Loading detailed content...</p>
          </div>
        ) : loadedDetailedContent ? (
          formatContent(loadedDetailedContent)
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-learn-500" />
            <p className="text-gray-400">Content is being generated in the background...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSection;
