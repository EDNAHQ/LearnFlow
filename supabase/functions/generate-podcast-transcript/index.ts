
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { content, title, topic } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating podcast transcript for: ${title || 'Untitled'}`);
    
    // Remove markdown formatting if needed
    const cleanContent = content
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/#{1,6}\s+/g, '') // Remove heading markers
      .replace(/\*\*/g, ''); // Remove bold markers

    // Use OpenAI to convert content to dialog format
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI assistant that converts educational content into an engaging podcast script. Create a natural conversation between two hosts (Host 1 and Host 2) that covers all the important information provided. Format the output as a podcast script with "Host 1:" and "Host 2:" prefixes. Make the conversation flow naturally and be engaging. Aim for about 5-10 minutes of dialog.'
          },
          { 
            role: 'user', 
            content: `Please convert the following educational content about "${topic || 'this topic'}" titled "${title || 'this lesson'}" into a podcast script:\n\n${cleanContent}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const transcript = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        success: true,
        transcript,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-podcast-transcript function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
