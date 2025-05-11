
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instructions, modalities, voice } = await req.json();
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a session with OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instructions: instructions || 'You are a helpful assistant',
        modalities: modalities || ['audio', 'text'],
        voice: voice || 'alloy'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Realtime API error:', response.status, errorText);
      throw new Error(`OpenAI Realtime API error: ${response.status}`);
    }
    
    const session = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: session
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in realtime-speech function:', error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        service: 'realtime-speech',
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
