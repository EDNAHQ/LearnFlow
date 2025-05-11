
import React from "react";
import QuestionPrompt from "./QuestionPrompt";

// Function to process text and identify potential question prompts
export const processTextWithQuestions = (
  text: string, 
  topic: string, 
  onInsightRequest: (question: string) => void
): React.ReactNode => {
  // This regex looks for text patterns that are likely to be questions
  // It matches text ending with "?" that is between 15-100 characters
  const questionRegex = /(\b[^.!?]{15,100}\?)/g;
  
  if (!questionRegex.test(text)) {
    return text;
  }
  
  // Replace questions with the interactive component
  const parts = text.split(questionRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) { // This is a question part
          return (
            <QuestionPrompt 
              key={i} 
              questionText={part} 
              topic={topic || ''}
              onInsightRequest={onInsightRequest} 
            />
          );
        }
        return part;
      })}
    </>
  );
};

// Helper function to escape special regex characters
export const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
