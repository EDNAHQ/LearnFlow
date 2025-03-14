
import React from "react";
import { HelpCircle, Loader2 } from "lucide-react";

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
  if (isLoading) {
    return (
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-lg font-semibold text-brand-purple mb-3 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#E84393]" />
          Generating Related Questions...
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analyzing content to create relevant questions
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <h3 className="text-lg font-semibold text-brand-purple mb-4 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-[#E84393]" />
        Explore Further
      </h3>
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
    </div>
  );
};

export default ContentRelatedQuestions;
