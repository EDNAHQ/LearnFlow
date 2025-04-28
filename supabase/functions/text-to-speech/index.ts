
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ElevenLabsClient } from "https://esm.sh/elevenlabs@0.2.2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Text-to-speech function called");
    
    // Parse the request body to get the text and pathId
    const { text, voiceId = "pFZP5JQG7iQjIQuC4Bku", pathId } = await req.json()

    if (!text) {
      console.error("No text provided for speech generation");
      throw new Error('Text is required')
    }

    if (!pathId) {
      console.error("No pathId provided");
      throw new Error('PathId is required')
    }

    // Get API key from environment variables
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!apiKey) {
      console.error("ELEVEN_LABS_API_KEY is not configured");
      throw new Error('ELEVEN_LABS_API_KEY is not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Text-to-speech request: ${text.length} characters, voice: ${voiceId}`);
    
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
        console.error("No audio data received from Eleven Labs API");
        throw new Error('No audio data received from Eleven Labs API');
      }
      
      console.log(`Successfully generated audio: ${audioData.length} bytes`);

      // Create a unique filename
      const timestamp = new Date().getTime()
      const filename = `audio_${pathId}_${timestamp}.mp3`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('audio_files')
        .upload(filename, audioData, {
          contentType: 'audio/mpeg',
          cacheControl: '3600'
        })

      if (uploadError) {
        console.error('Error uploading audio:', uploadError);
        throw new Error(`Failed to upload audio: ${uploadError.message}`);
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('audio_files')
        .getPublicUrl(filename)

      // Update the learning path with the audio URL
      const { error: updateError } = await supabase
        .from('learning_paths')
        .update({ audio_url: publicUrl })
        .eq('id', pathId)

      if (updateError) {
        console.error('Error updating learning path:', updateError);
        throw new Error(`Failed to update learning path: ${updateError.message}`);
      }

      // Return success response with the audio URL
      return new Response(
        JSON.stringify({ 
          audioUrl: publicUrl,
          message: 'Audio generated and stored successfully' 
        }), 
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
      
    } catch (elevenlabsError) {
      console.error('Eleven Labs API error:', elevenlabsError);
      let errorMessage = 'Eleven Labs API error';
      if (elevenlabsError.response) {
        try {
          const errorBody = await elevenlabsError.response.text();
          errorMessage = `Eleven Labs API error (${elevenlabsError.response.status}): ${errorBody}`;
        } catch (e) {
          errorMessage = `Eleven Labs API error: Status code ${elevenlabsError.response.status}`;
        }
      } else {
        errorMessage = `Eleven Labs API error: ${elevenlabsError.message || 'Unknown error'}`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error in text-to-speech function:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        service: 'text-to-speech',
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
