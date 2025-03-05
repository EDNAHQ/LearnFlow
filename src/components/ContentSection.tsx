
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
}

const ContentSection = ({ title, content, index }: ContentSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [index]);

  // Format the content with proper markdown-like rendering
  const formatContent = () => {
    const paragraphs = content.split("\n\n");
    
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
        {formatContent()}
      </div>
    </div>
  );
};

export default ContentSection;
