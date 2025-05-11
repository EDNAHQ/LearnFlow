
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse request body
    const requestData = await req.json();
    
    // Extract parameters with defaults
    const {
      instructions = "You are a friendly assistant.",
      modalities = ["audio", "text"],
      voice = "alloy"
    } = requestData;

    console.log("Creating real-time speech session with OpenAI");
    
    // Prepare the request payload
    const payload = {
      model: "gpt-4o-realtime-preview",
      modalities,
      instructions,
      voice
    };

    // Call OpenAI's real-time API to create a session
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    // Get the session data from OpenAI
    const sessionData = await response.json();
    
    console.log("Successfully created real-time session");

    // Return the session data to the client
    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: sessionData.id,
          token: sessionData.client_secret.value,
          created_at: sessionData.created_at,
          expires_at: sessionData.expires_at
        },
        modalities
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in realtime-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
