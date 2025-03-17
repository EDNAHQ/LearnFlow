
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ElevenLabsClient } from "https://esm.sh/elevenlabs@0.2.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body to get the text and voiceId
    const { text, voiceId = "pFZP5JQG7iQjIQuC4Bku" } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // Get API key from environment variables
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!apiKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not configured')
    }

    console.log(`Text-to-speech request: ${text.length} characters, voice: ${voiceId}`)
    
    // Initialize ElevenLabs client
    const client = new ElevenLabsClient({
      apiKey: apiKey,
    });

    try {
      // Generate audio from text
      const audioData = await client.textToSpeech.convert(voiceId, {
        output_format: "mp3_44100_128",
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      });
      
      if (!audioData || audioData.length === 0) {
        throw new Error('No audio data received from Eleven Labs API');
      }
      
      console.log(`Successfully generated audio: ${audioData.length} bytes`);
      
      // Return audio data directly as binary with proper Content-Type
      return new Response(audioData, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
        },
      });
    } catch (elevenlabsError: any) {
      console.error('Eleven Labs API error:', elevenlabsError);
      
      // Provide more detailed error information
      const errorResponse = elevenlabsError.response 
        ? `Status code: ${elevenlabsError.response.status}\nBody: ${await elevenlabsError.response.text()}` 
        : elevenlabsError.message;
        
      throw new Error(`Eleven Labs API error: ${errorResponse}`);
    }
  } catch (error: any) {
    console.error('Error in text-to-speech function:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
