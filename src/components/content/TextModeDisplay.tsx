
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ContentLoader from "@/components/content/ContentLoader";
import ContentDetailLoader from "@/components/content/ContentDetailLoader";
import ContentQuestionsGenerator from "@/components/content/ContentQuestionsGenerator";
import ContentRelatedQuestions from "@/components/ContentRelatedQuestions";

interface TextModeDisplayProps {
  title: string;
  content: string;
  detailedContent?: string | null;
  topic?: string;
  index: number;
  pathId?: string;
  isFirstStep?: boolean;
}

const TextModeDisplay = ({ 
  title,
  content,
  detailedContent,
  topic,
  index,
  pathId,
  isFirstStep = false
}: TextModeDisplayProps) => {
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(Date.now());

  // Extract step ID from content if it's in expected format
  const stepId = typeof content === 'string' && content.includes(':') 
    ? content.split(":")[0].trim() 
    : '';

  const handleContentLoaded = (loadedContent: string) => {
    setRenderedContent(loadedContent);
    // Only mark as ready if we have substantial content
    if (loadedContent && loadedContent.length > 100) {
      setIsReady(true);
    }
  };

  // Reset state when content changes
  useEffect(() => {
    setRenderedContent("");
    setQuestions([]);
    setIsReady(false);
    setLoadStartTime(Date.now());
    
    // Initialize with detailed content if available
    if (detailedContent && typeof detailedContent === 'string') {
      setRenderedContent(detailedContent);
      setIsReady(true);
    }
  }, [content, detailedContent, index]);

  // Add timeout to show content even if not fully ready
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isReady && renderedContent.length > 0) {
        console.log("Content load timeout - showing partial content");
        setIsReady(true);
      }
    }, 5000); // Show content after 5 seconds even if not "ready"
    
    return () => clearTimeout(timeoutId);
  }, [isReady, renderedContent]);

  // If loading takes too long, show whatever content we have
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isReady) {
        console.log("Content load timeout - forcing display");
        setIsReady(true);
      }
    }, 10000); // Force content display after 10 seconds
    
    return () => clearTimeout(timeoutId);
  }, [isReady]);

  const loadTimeElapsed = Date.now() - loadStartTime;
  
  return (
    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none px-4 md:px-8 relative">
      {!isReady && (
        <ContentLoader message={loadTimeElapsed > 5000 ? "Still working on generating content..." : "Preparing your content..."} />
      )}
      
      <div className={isReady ? "opacity-100 transition-opacity duration-500" : "opacity-0 absolute"}>
        <ReactMarkdown className="prose prose-img:rounded-lg prose-headings:font-bold prose-a:text-blue-600 max-w-none">
          {renderedContent || `# ${title}\n\n${content}`}
        </ReactMarkdown>
        
        {isReady && questions.length > 0 && (
          <ContentRelatedQuestions 
            questions={questions} 
            isLoading={false}
            onQuestionClick={() => {}}
          />
        )}
      </div>
      
      {/* Only attempt to load content if we have a valid step ID */}
      {stepId && (
        <ContentDetailLoader
          stepId={stepId}
          title={title}
          content={content}
          topic={topic}
          detailedContent={detailedContent}
          onContentLoaded={handleContentLoaded}
          isFirstStep={isFirstStep}
        />
      )}
      
      {renderedContent.length > 200 && (
        <ContentQuestionsGenerator
          content={renderedContent}
          topic={topic}
          title={title}
          stepId={stepId}
          onQuestionsGenerated={setQuestions}
        />
      )}
    </div>
  );
};

export default TextModeDisplay;
