
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { generateStepContent } from "@/utils/learningUtils";
import { Loader2, FileText, Book } from "lucide-react";
import AIInsightsPopup from "./AIInsightsPopup";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentSection = ({ title, content, index, detailedContent, pathId, topic }: ContentSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(detailedContent || null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const stepId = content.split(":")[0]; // Extract step ID from content

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    // Update loaded content when detailed content prop changes
    if (detailedContent) {
      setLoadedDetailedContent(detailedContent);
      setIsLoading(false);
    }
  }, [detailedContent]);

  // If no detailed content, try to load it directly
  useEffect(() => {
    if (!loadedDetailedContent && stepId && topic && !isLoading) {
      const loadContent = async () => {
        setIsLoading(true);
        try {
          const generatedContent = await generateStepContent(
            { id: stepId, title, description: content.split(":")[1] || "" },
            topic
          );
          setLoadedDetailedContent(generatedContent);
        } catch (error) {
          console.error("Error loading content:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadContent();
    }
  }, [loadedDetailedContent, stepId, title, content, topic, isLoading]);

  // Handle text selection for AI insights
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      
      if (text && text.length > 5 && text.length < 500) {
        // Get selection coordinates for positioning the popup
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setPopupPosition({ 
          x: rect.left + (rect.width / 2), 
          y: rect.bottom + window.scrollY 
        });
      }
    }
  }, []);

  // Close popup and clear selection
  const handleClosePopup = useCallback(() => {
    setSelectedText("");
    setPopupPosition(null);
    
    // Clear text selection
    if (window.getSelection) {
      if (window.getSelection()?.empty) {
        window.getSelection()?.empty();
      } else if (window.getSelection()?.removeAllRanges) {
        window.getSelection()?.removeAllRanges();
      }
    }
  }, []);

  // Format the content with proper markdown-like rendering
  const formatContent = (text: string) => {
    const paragraphs = text.split("\n\n");
    
    return paragraphs.map((paragraph, i) => {
      // Check if this is a heading (starts with # or ##)
      if (paragraph.startsWith('# ')) {
        return (
          <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-learn-800">
            {paragraph.replace('# ', '')}
          </h2>
        );
      } else if (paragraph.startsWith('## ')) {
        return (
          <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-learn-700">
            {paragraph.replace('## ', '')}
          </h3>
        );
      } else if (paragraph.startsWith('### ')) {
        return (
          <h4 key={i} className="text-lg font-medium mt-5 mb-2 text-learn-700">
            {paragraph.replace('### ', '')}
          </h4>
        );
      } else if (paragraph.startsWith('```')) {
        // Handle code blocks
        const code = paragraph.replace(/```(.+)?\n/g, '').replace(/```$/g, '');
        return (
          <pre key={i} className="bg-gray-100 p-4 rounded-lg mb-5 overflow-x-auto border border-gray-200">
            <code className="text-sm font-mono text-gray-800 whitespace-pre">{code}</code>
          </pre>
        );
      } else if (paragraph.startsWith('- ')) {
        // Handle bullet points
        const listItems = paragraph.split('\n- ');
        return (
          <ul key={i} className="list-disc pl-6 mb-5 space-y-2">
            {listItems.map((item, j) => (
              <li key={`${i}-${j}`} className="text-pretty text-lg">
                {item.replace('- ', '')}
              </li>
            ))}
          </ul>
        );
      } else if (paragraph.startsWith('1. ')) {
        // Handle numbered lists
        const listItems = paragraph.split(/\n\d+\. /);
        return (
          <ol key={i} className="list-decimal pl-6 mb-5 space-y-2">
            {listItems.map((item, j) => (
              <li key={`${i}-${j}`} className="text-pretty text-lg">
                {j === 0 ? item.replace('1. ', '') : item}
              </li>
            ))}
          </ol>
        );
      } else if (paragraph.startsWith('> ')) {
        // Handle blockquotes
        return (
          <blockquote key={i} className="border-l-4 border-[#6D42EF] pl-4 py-1 mb-5 text-lg italic bg-gray-50 rounded-r-lg">
            {paragraph.replace('> ', '')}
          </blockquote>
        );
      } else {
        return (
          <p key={i} className="mb-5 text-lg leading-relaxed text-pretty">
            {paragraph}
          </p>
        );
      }
    });
  };

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-in-out bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {!loadedDetailedContent || isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin mb-3 text-[#6D42EF]" />
            <Book className="w-5 h-5 text-[#E84393] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 mt-4">Content is being generated...</p>
          <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
        </div>
      ) : (
        <div 
          className="prose prose-gray max-w-none"
          onMouseUp={handleTextSelection}
        >
          {formatContent(loadedDetailedContent)}
          
          {/* Small helper tip */}
          <div className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4 italic">
            Tip: Highlight any text to get AI insights about specific topics
          </div>
        </div>
      )}
      
      {/* AI Insights Popup */}
      {selectedText && popupPosition && topic && (
        <AIInsightsPopup
          selectedText={selectedText}
          position={popupPosition}
          onClose={handleClosePopup}
          topic={topic}
        />
      )}
    </div>
  );
};

export default ContentSection;
