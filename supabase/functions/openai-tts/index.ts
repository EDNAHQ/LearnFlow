
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { initSupabaseClient } from "../text-to-speech/utils.ts";

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
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'audio_files')) {
      console.log("Creating audio_files bucket");
      await supabase.storage.createBucket('audio_files', { public: true });
    }
    
    // Check for existing audio
    const { data: existingAudio } = await supabase
      .from('learning_paths')
      .select('audio_url')
      .eq('id', pathId)
      .single();
      
    if (existingAudio?.audio_url) {
      console.log("Existing audio found:", existingAudio.audio_url);
      return new Response(
        JSON.stringify({ 
          audioUrl: existingAudio.audio_url,
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
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const filename = `openai_audio_${pathId}_${timestamp}.mp3`;
    
    // Upload to Supabase Storage
    console.log(`Uploading audio file: ${filename}`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('audio_files')
      .upload(filename, audioData, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Error uploading audio:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }
    console.log("Audio file uploaded successfully");

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('audio_files')
      .getPublicUrl(filename);

    console.log(`Audio public URL: ${publicUrl}`);

    // Update the learning path with the audio URL
    console.log(`Updating learning path ${pathId} with audio URL`);
    const { error: updateError } = await supabase
      .from('learning_paths')
      .update({ audio_url: publicUrl })
      .eq('id', pathId);

    if (updateError) {
      console.error('Error updating learning path:', updateError);
      throw new Error(`Failed to update learning path: ${updateError.message}`);
    }
    console.log("Learning path updated successfully");

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
