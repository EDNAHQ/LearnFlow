
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
    const { text, voiceId = "pFZP5JQG7iQjIQuC4Bku" } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log(`Converting text to speech using Eleven Labs API. Text length: ${text.length}, Voice ID: ${voiceId}`)
    
    // Initialize ElevenLabs client
    const client = new ElevenLabsClient({
      apiKey: Deno.env.get('ELEVEN_LABS_API_KEY') || '',
    });

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
    
    // Return audio data
    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('Error in text-to-speech function:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
