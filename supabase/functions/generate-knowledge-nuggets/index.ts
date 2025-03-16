
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    const { topic } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating knowledge nuggets for topic: ${topic}`);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
    
    // Call OpenAI to generate knowledge nuggets with improved prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: 'system', 
          content: `You are an expert educator specializing in creating engaging, insightful knowledge nuggets. 
          Your goal is to generate 5 fascinating, thought-provoking facts or insights about the given topic 
          that will genuinely surprise and intrigue learners. Each nugget should:
          
          1. Be concise (under 240 characters) but impactful
          2. Reveal a non-obvious or counterintuitive aspect about the topic
          3. Connect the topic to real-world applications or surprising contexts
          4. Use clear, precise language with specific examples where possible
          5. Spark curiosity and the desire to learn more
          
          Avoid generic statements, obvious facts, or vague claims. Return the nuggets as a JSON array of strings.`
        },
        { role: 'user', content: `Topic: ${topic}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const nuggets = JSON.parse(content).nuggets;

    return new Response(
      JSON.stringify({ 
        success: true,
        nuggets,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-knowledge-nuggets function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
