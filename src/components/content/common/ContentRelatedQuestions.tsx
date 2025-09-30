import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentRelatedQuestionsProps {
  questions: string[];
  isLoading: boolean;
  onQuestionClick: (question: string, content?: string) => void;
  topic?: string;
  content?: string;
}

const ContentRelatedQuestions = ({
  questions,
  isLoading,
  onQuestionClick,
  topic = "",
  content = ""
}: ContentRelatedQuestionsProps) => {
  const handleQuestionClick = (question: string) => {
    console.log("Question clicked in ContentRelatedQuestions:", question);
    // Call parent callback to trigger page-level modal
    onQuestionClick(question, content);
  };

  return (
    <>
      <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent">
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
                className="underline cursor-pointer text-left flex items-start group transition-colors text-brand-primary hover:text-brand-accent"
              >
                <span className="inline-block w-6 text-brand-primary/60 group-hover:text-brand-accent shrink-0 transition-colors">
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
    </>
  );
};

export default ContentRelatedQuestions;


