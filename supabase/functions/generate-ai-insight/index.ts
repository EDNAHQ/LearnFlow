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
    const { selectedText, topic, question } = await req.json();

    if (!question) {
      throw new Error('Question is required');
    }

    // Initialize AI client
    const aiClient = createAIClient();

    // Create a focused prompt for the question
    const prompt = `You are an expert tutor helping a student understand "${topic}".

The student is asking: ${question}

${selectedText ? `Context from the current content:
${selectedText}` : ''}

Provide a clear, concise, and helpful explanation that directly answers their question.
Keep your response focused, educational, and easy to understand.
Use markdown formatting for better readability.`;

    const response = await aiClient.chat({
      functionType: 'quick-insights',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const insight = response.content || "I couldn't generate an insight for this question.";

    return new Response(
      JSON.stringify({ insight }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-ai-insight function:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate insight',
        insight: "Sorry, I couldn't generate an insight for this question. Please try again."
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});