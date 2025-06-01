
import { useCallback } from 'react';
import { RealtimeSpeechContextOptions } from './types';

/**
 * Hook to generate learning context for the AI assistant
 * based on the topic and learning path steps
 */
export function useLearningContext() {
  /**
   * Generate a context string based on learning steps
   */
  const getLearningContext = useCallback(({ topic, steps }: RealtimeSpeechContextOptions) => {
    if (!steps || steps.length === 0) {
      return `Topic: ${topic}`;
    }
    
    // Extract key information from steps to provide context
    const stepSummaries = steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}`
    ).join('\n');
    
    return `
      Topic: ${topic}
      Learning Path Structure:
      ${stepSummaries}
      
      Use this learning path context to provide relevant answers. When answering questions,
      refer to specific learning steps when appropriate. If the user asks about topics covered
      in the learning path, mention which step contains that information.
    `;
  }, []);

  /**
   * Generate custom instructions for the AI assistant
   */
  const getAssistantInstructions = useCallback(({ topic, steps }: RealtimeSpeechContextOptions) => {
    const learningContext = getLearningContext({ topic, steps });
    
    return `You are a friendly and helpful learning assistant specializing in ${topic}. ${learningContext} Keep answers conversational, engaging, and informative. Focus on helping the user understand concepts deeply and relate them to the learning materials.`;
  }, [getLearningContext]);

  /**
   * Generate a contextual initial prompt if none was provided
   */
  const getDefaultInitialPrompt = useCallback(({ topic, steps }: RealtimeSpeechContextOptions) => {
    if (steps && steps.length > 0) {
      return `I'm learning about ${topic}. This learning path has ${steps.length} steps, starting with "${steps[0]?.title}". Can you give me a brief introduction and explain how you can help me learn this topic?`;
    }
    
    return `I'm learning about ${topic}. Can you give me a brief introduction and explain how you can help me learn this topic?`;
  }, []);

  return {
    getLearningContext,
    getAssistantInstructions,
    getDefaultInitialPrompt
  };
}
