
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
        {content.split("\n").map((paragraph, i) => (
          <p key={i} className="mb-4 text-pretty">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ContentSection;
