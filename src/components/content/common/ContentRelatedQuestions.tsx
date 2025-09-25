import React from "react";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

interface ContentRelatedQuestionsProps {
  questions: string[];
  isLoading: boolean;
  onQuestionClick: (question: string) => void;
}

const ContentRelatedQuestions = ({
  questions,
  isLoading,
  onQuestionClick
}: ContentRelatedQuestionsProps) => {
  const handleQuestionClick = (question: string) => {
    console.log("Question clicked in ContentRelatedQuestions:", question);
    onQuestionClick(question);
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", AI_STYLES.text.primary)}>
        <Sparkles className={cn("h-5 w-5", AI_STYLES.text.accent)} />
        Explore Further
      </h3>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-start">
              <span className="inline-block w-6 text-gray-400 shrink-0">
                {index}.
              </span>
              <Skeleton className="h-6 w-full bg-gray-100" />
            </div>
          ))}
        </div>
      ) : questions && questions.length > 0 ? (
        <ul className="space-y-3">
          {questions.map((question, index) => (
            <li key={index}>
              <button
                onClick={() => handleQuestionClick(question)}
                className={cn(
                  "underline cursor-pointer text-left flex items-start group transition-colors",
                  AI_STYLES.text.primary,
                  "hover:text-brand-accent"
                )}
              >
                <span className="inline-block w-6 text-gray-600 shrink-0">
                  {index + 1}.
                </span>
                <span>{question}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 italic">
          Ask your own questions about this topic using the AI Insights feature!
        </p>
      )}
    </div>
  );
};

export default ContentRelatedQuestions;


