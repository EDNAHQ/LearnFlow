import { createAIClient } from "../../../_shared/ai-provider/index.ts";

// Core AI API call function using the new unified client
export async function callOpenAI(
  prompt: string,
  systemMessage: string,
  responseFormat?: "json_object",
  maxTokens = 1500
) {
  console.log("Calling AI API via unified client");

  const aiClient = createAIClient();

  try {
    const response = await aiClient.chat({
      functionType: 'content-generation',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      responseFormat,
      maxTokens,
    });

    console.log(`AI response received from ${response.provider} (${response.model})`);

    // Format response to match the old OpenAI SDK structure for backwards compatibility
    return {
      choices: [{
        message: {
          content: response.content
        }
      }],
      model: response.model,
      usage: response.tokensUsed ? {
        total_tokens: response.tokensUsed
      } : undefined
    };
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw new Error(`Failed to call AI API: ${error.message}`);
  }
}