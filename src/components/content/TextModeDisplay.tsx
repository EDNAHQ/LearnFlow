
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ContentLoader from "@/components/content/ContentLoader";
import ContentDetailLoader from "@/components/content/ContentDetailLoader";
import ContentQuestionsGenerator from "@/components/content/ContentQuestionsGenerator";
import ContentRelatedQuestions from "@/components/ContentRelatedQuestions";
import { contentStyles } from "@/utils/contentFormatter";

interface TextModeDisplayProps {
  stepData: any;
  title: string;
  topic?: string;
  safeContent: string;
}

const TextModeDisplay = ({ 
  stepData,
  title,
  topic,
  safeContent
}: TextModeDisplayProps) => {
  const [content, setContent] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(Date.now());

  const handleContentLoaded = (loadedContent: string) => {
    setContent(loadedContent);
    // Only mark as ready if we have substantial content
    if (loadedContent && loadedContent.length > 100) {
      setIsReady(true);
    }
  };

  // Reset state when step changes
  useEffect(() => {
    setContent("");
    setQuestions([]);
    setIsReady(false);
    setLoadStartTime(Date.now());
  }, [stepData?.id]);

  // Add timeout to show content even if not fully ready
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isReady && content.length > 0) {
        console.log("Content load timeout - showing partial content");
        setIsReady(true);
      }
    }, 5000); // Show content after 5 seconds even if not "ready"
    
    return () => clearTimeout(timeoutId);
  }, [isReady, content]);

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
        <ReactMarkdown className={contentStyles}>
          {content || `# ${title}\n\n${safeContent}`}
        </ReactMarkdown>
        
        {isReady && questions.length > 0 && (
          <ContentRelatedQuestions questions={questions} />
        )}
      </div>
      
      <ContentDetailLoader
        stepId={stepData?.id}
        title={stepData?.title || title}
        content={safeContent}
        topic={topic}
        detailedContent={stepData?.detailed_content}
        onContentLoaded={handleContentLoaded}
        isFirstStep={true}
      />
      
      {content.length > 200 && (
        <ContentQuestionsGenerator
          content={content}
          topic={topic}
          title={stepData?.title || title}
          stepId={stepData?.id}
          onQuestionsGenerated={setQuestions}
        />
      )}
    </div>
  );
};

export default TextModeDisplay;
