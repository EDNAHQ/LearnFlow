
import React from "react";
import { HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  // If no questions and not loading, don't render anything
  if (!isLoading && (!questions || questions.length === 0)) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <h3 className="text-lg font-semibold text-brand-purple mb-4 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-[#E84393]" />
        Explore Further
      </h3>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-start">
              <span className="inline-block w-6 text-gray-400 shrink-0">
                {index}.
              </span>
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {questions.map((question, index) => (
            <li key={index}>
              <button
                onClick={() => onQuestionClick(question)}
                className="text-[#6D42EF] hover:text-[#E84393] underline cursor-pointer text-left flex items-start group transition-colors"
              >
                <span className="inline-block w-6 text-gray-400 shrink-0">
                  {index + 1}.
                </span>
                <span>{question}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContentRelatedQuestions;
