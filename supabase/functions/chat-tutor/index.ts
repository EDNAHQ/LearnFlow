import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversationHistory, generatePrompts } = await req.json();

    if (!message && !generatePrompts) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing chat ${generatePrompts ? 'prompt generation' : 'message'} for topic: ${context?.topic}`);

    // Initialize AI client
    const aiClient = createAIClient();

    // Handle prompt generation requests
    if (generatePrompts) {
      console.log('Generating contextual prompts for topic:', context?.topic);

      try {
        const promptSystemMessage = `You are an expert tutor. Based on the following learning content, generate exactly 4 specific, engaging conversation starter questions.

Topic: "${context?.topic || 'this topic'}"
Content snippet: "${context?.content?.substring(0, 500) || 'No content provided'}"

Requirements:
1. Questions must be specific to THIS content, not generic
2. Each question should explore a different aspect (understanding, examples, connections, practical application)
3. Keep questions concise but thought-provoking
4. Make them conversational and engaging

Respond with ONLY a JSON array of 4 question strings, like this:
["First specific question?", "Second specific question?", "Third specific question?", "Fourth specific question?"]`;

        const response = await aiClient.chat({
          functionType: 'chat-tutor',
          messages: [
            { role: 'system' as const, content: promptSystemMessage },
            { role: 'user' as const, content: 'Generate 4 conversation starters now.' }
          ],
        });

        console.log('AI response for prompts:', response.content);

        // Try to extract JSON array from response
        let prompts;
        const content = response.content.trim();

        // Try direct JSON parse first
        try {
          prompts = JSON.parse(content);
        } catch {
          // Try to extract JSON array from markdown or other formatting
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            prompts = JSON.parse(jsonMatch[0]);
          }
        }

        if (Array.isArray(prompts) && prompts.length >= 4) {
          const finalPrompts = prompts.slice(0, 4).map(p => String(p).trim());
          console.log('Generated prompts:', finalPrompts);

          return new Response(
            JSON.stringify({ suggestedPrompts: finalPrompts }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error generating prompts:', error);
      }

      // Fallback prompts if generation fails
      console.log('Using fallback prompts');
      const fallbackPrompts = [
        `What are the key concepts in ${context?.topic || 'this topic'}?`,
        `Can you give me a practical example of how this applies?`,
        `How does this connect to what we've learned so far?`,
        `What's the most important thing to remember here?`
      ];

      return new Response(
        JSON.stringify({ suggestedPrompts: fallbackPrompts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the conversation with system prompt for regular chat
    const systemPrompt = `You are a friendly AI tutor helping a student learn about "${context?.topic || 'various topics'}".

CRITICAL RULES:
- Keep responses SHORT (2-4 sentences max for most answers)
- Be conversational and encouraging
- Use simple, clear language
- One concept at a time
- Ask ONE follow-up question to check understanding or encourage deeper thinking

Your approach:
1. Give a brief, clear answer (1-2 sentences)
2. If helpful, add a simple example or analogy (1 sentence)
3. End with ONE thought-provoking question OR encouragement

Never:
- Write long paragraphs
- Use excessive formatting or bullet points
- Overwhelm with information
- Be overly academic

Remember: You're having a conversation, not giving a lecture. Be helpful but concise.

${context?.content ? `\n\nCurrent learning content:\n${context.content}` : ''}`;

    // Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user' as const, content: message }
    ];

    const response = await aiClient.chat({
      functionType: 'chat-tutor',
      messages,
    });

    const responseContent = response.content;

    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    console.log(`Successfully generated chat response using ${response.model}`);

    return new Response(
      JSON.stringify({ response: responseContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-tutor function:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        response: "I apologize, but I'm having trouble responding right now. Please try again in a moment."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
