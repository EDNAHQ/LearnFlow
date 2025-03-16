
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.28.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openAIApiKey
    });
    
    // Generate insights using OpenAI
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
      Your explanation should:
      1. Clarify any complex concepts mentioned
      2. Provide additional context if needed
      3. Explain why this concept is important in the broader context of ${topic}
      4. Give a concrete, relevant example if applicable
      
      Keep your response friendly, educational, and specifically focused on the highlighted text.
      The learner wants to quickly understand this concept better without getting overwhelmed.
      `;
    }

    // Try with gpt-4o-mini first as it's more reliable
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: 'system', 
            content: `You are an expert educator creating concise and insightful explanations about topics related to ${topic}.`
          },
          { role: 'user', content: prompt }
        ],
      });

      const insight = completion.choices[0].message.content;
      
      console.log(`Successfully generated insight (${insight.length} characters)`);

      return new Response(
        JSON.stringify({ insight }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error with gpt-4o-mini model:', error);
      
      // If there's an error with gpt-4o-mini, we could try falling back to o3-mini
      // but since we're already using the more reliable model first, we'll just
      // return the error for now
      
      return new Response(
        JSON.stringify({ error: error.message || 'Error generating insight' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-ai-insight function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
