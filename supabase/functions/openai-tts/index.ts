
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, initSupabaseClient, ensureAudioBucketExists, checkExistingAudio, prepareTextForGeneration, storeAudioAndUpdatePath } from "../_shared/utils.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("OpenAI TTS function called");
    
    // Parse the request body
    const { text, voice = "nova", pathId, instructions = "" } = await req.json();

    if (!text) {
      console.error("No text provided for speech generation");
      throw new Error('Text is required');
    }

    if (!pathId) {
      console.error("No pathId provided");
      throw new Error('PathId is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const supabase = initSupabaseClient(supabaseUrl!, supabaseServiceKey!);
    console.log("Supabase client initialized successfully");
    
    // Check if audio_files bucket exists and create it if not
    await ensureAudioBucketExists(supabase);
    
    // Check for existing audio
    const existingAudioUrl = await checkExistingAudio(supabase, pathId);
    if (existingAudioUrl) {
      console.log("Existing audio found:", existingAudioUrl);
      return new Response(
        JSON.stringify({ 
          audioUrl: existingAudioUrl,
          message: 'Using existing audio URL' 
        }), 
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    // Prepare text for generation (truncate if too long)
    const MAX_TEXT_LENGTH = 4000; // OpenAI TTS has limitations
    const trimmedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) + "..." 
      : text;
    
    console.log(`Calling OpenAI API with voice ${voice} and text length ${trimmedText.length}`);
    
    // Generate audio from text using OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: voice,
        input: trimmedText,
        instructions: instructions,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    // Get audio data as array buffer
    const audioData = new Uint8Array(await response.arrayBuffer());
    
    if (!audioData || audioData.length === 0) {
      throw new Error('No audio data received from OpenAI API');
    }
    
    console.log(`Successfully generated audio: ${audioData.length} bytes`);
    
    // Store audio and update learning path
    const publicUrl = await storeAudioAndUpdatePath(supabase, pathId, audioData);
    
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
  } catch (error) {
    console.error('Error in OpenAI TTS function:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        service: 'openai-tts',
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
