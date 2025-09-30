// Centralized, human-friendly names for Supabase Edge Functions used in the app

export const EDGE_FUNCTIONS = {
  // Learning content
  generateLearningContent: 'generate-learning-content', // generates step content and suggested questions

  // Insights
  generateAIInsight: 'generate-ai-insight', // answers a user question about the current content/topic

  // Related topics and deep dives
  listRelatedTopics: 'generate-deep-dive-topics', // produces related topics list
  generateDeepDiveContent: 'generate-deep-dive-content', // generates deep dive article for a selected topic

  // Audio
  textToSpeechOpenAI: 'openai-tts',
  textToSpeechElevenLabs: 'text-to-speech',
} as const;

export type EdgeFunctionName = typeof EDGE_FUNCTIONS[keyof typeof EDGE_FUNCTIONS];


