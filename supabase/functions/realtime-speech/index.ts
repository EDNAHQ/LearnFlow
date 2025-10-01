
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instructions, voice, content, topic, initialPrompt, pathId, modalities } = await req.json();

    console.log(`Creating Realtime API session for pathId: ${pathId}, topic: ${topic}`);

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate ephemeral client secret for Realtime API (GA endpoint)
    const sessionConfig = {
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions: instructions || `You are a helpful learning assistant discussing ${topic || 'various topics'}. ${content ? `Here is the learning content: ${content.substring(0, 500)}` : ''}`,
        audio: {
          output: {
            voice: voice || "alloy"
          }
        }
      }
    };

    // Create ephemeral key for client-side connection using GA endpoint
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Realtime API error:', response.status, errorText);
      throw new Error(`OpenAI Realtime API error: ${response.status} - ${errorText}`);
    }

    const sessionData = await response.json();

    console.log('Realtime session created successfully');

    // Return session configuration for client
    return new Response(
      JSON.stringify({
        success: true,
        session: {
          client_secret: sessionData.value // Client secret is at .value in GA API
        },
        message: 'Realtime session created successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
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
