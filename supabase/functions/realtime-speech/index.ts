
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instructions, voice, content, pathId } = await req.json();
    
    // Use the most specific content available for text-to-speech
    const textToConvert = content || instructions || 
      'Hello, this is a test of the realtime speech function.';
    
    console.log(`Converting text to speech for pathId: ${pathId}, content length: ${textToConvert.length}`);
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a session with OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voice || 'alloy',
        input: textToConvert,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    // Get audio data as array buffer
    const audioData = new Uint8Array(await response.arrayBuffer());
    
    // Return the audio data directly
    return new Response(audioData, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'audio/mpeg'
      },
      status: 200
    });
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
