
import React from "react";
import { HelpCircle } from "lucide-react";

const QuestionPrompt = ({ 
  questionText, 
  topic,
  onInsightRequest 
}: { 
  questionText: string; 
  topic: string;
  onInsightRequest: (question: string) => void;
}) => {
  return (
    <span 
      className="inline-flex items-center text-[#6D42EF] underline cursor-pointer gap-1 group"
      onClick={() => onInsightRequest(questionText)}
    >
      {questionText}
      <HelpCircle className="h-3.5 w-3.5 inline-block opacity-70 group-hover:opacity-100" />
    </span>
  );
};

export default QuestionPrompt;
