import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIClient } from "../_shared/ai-provider/index.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

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
    // Parse request body
    const { selectedText, topic, question } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required topic parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating insights for ${question ? 'question about' : 'selected text on'} topic: ${topic}`);

    // Initialize AI client
    const aiClient = createAIClient();

    // Generate insights using AI
    let prompt = '';

    if (question) {
      // If a specific question was asked about the content
      prompt = `
      You are an expert educator specialized in the topic of "${topic}".

      A learner has a specific question about the content they're studying:
      "${question}"

      ${selectedText ? `This question relates to the following text:
      """
      ${selectedText}
      """` : 'Answer this question in the context of the broader topic.'}

      Please provide a clear, educational response to their question (150-250 words maximum).
      Use short paragraphs of 2-4 sentences maximum, with frequent paragraph breaks.
      Focus specifically on answering their question while providing context from the broader topic of ${topic}.
      Include a concrete example or application if relevant.

      Keep your response friendly, educational, and specifically focused on their question.
      `;
    } else {
      // Default insight generation without a specific question
      prompt = `
      You are an expert educator specialized in the topic of "${topic}".

      A learner has highlighted the following text while studying:

      """
      ${selectedText}
      """

      Please provide a concise but insightful explanation (100-150 words maximum) about this text.
      Use short paragraphs of 2-4 sentences maximum.

      Your explanation should:
      1. Clarify any complex concepts mentioned
      2. Provide additional context if needed
      3. Explain why this concept is important in the broader context of ${topic}
      4. Give a concrete, relevant example if applicable

      Keep your response friendly, educational, and specifically focused on the highlighted text.
      The learner wants to quickly understand this concept better without getting overwhelmed.
      `;
    }

    const systemMessage = `You are an expert educator creating concise and insightful explanations about topics related to ${topic}. You write using short paragraphs of 2-4 sentences maximum to improve readability.`;

    const response = await aiClient.chat({
      functionType: 'quick-insights',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      maxTokens: 500,
    });

    const insight = response.content;

    console.log(`Successfully generated insight (${insight.length} characters) using ${response.model}`);

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-ai-insight function:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});