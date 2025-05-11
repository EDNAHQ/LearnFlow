
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Supabase client with proper error handling
const initSupabaseClient = (url: string, key: string) => {
  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, key);
};

// Check if audio_files bucket exists, create if not
const ensureAudioBucketExists = async (supabase: any) => {
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error("Error listing buckets:", bucketsError);
    throw new Error(`Failed to list buckets: ${bucketsError.message}`);
  }
  
  const audioBucketExists = buckets?.some(bucket => bucket.name === 'audio_files');
  
  if (!audioBucketExists) {
    console.log("Creating audio_files bucket");
    const { error: createBucketError } = await supabase.storage.createBucket('audio_files', {
      public: true,
      fileSizeLimit: 50000000 // 50MB
    });
    
    if (createBucketError) {
      console.error("Error creating audio_files bucket:", createBucketError);
      throw new Error(`Failed to create audio_files bucket: ${createBucketError.message}`);
    }
  }
};

// Check if an audio file already exists for this path
const checkExistingAudio = async (supabase: any, pathId: string) => {
  const { data: pathData, error: pathError } = await supabase
    .from('learning_paths')
    .select('audio_url')
    .eq('id', pathId)
    .single();

  if (pathError) {
    console.error("Error fetching path data:", pathError);
    return null;
  }

  if (pathData?.audio_url) {
    console.log('Found existing audio URL:', pathData.audio_url);
    
    // Check if the file actually exists in storage
    const fileUrl = pathData.audio_url.split('/').pop();
    if (!fileUrl) return null;
    
    try {
      const { data: fileExists } = await supabase
        .storage
        .from('audio_files')
        .download(fileUrl);
        
      if (fileExists) {
        return pathData.audio_url;
      }
    } catch (err) {
      console.log("Existing audio file not found, will regenerate");
    }
  }
  
  return null;
};

// Prepare text for generation by handling length limitations
const prepareTextForGeneration = (text: string) => {
  const maxTextLength = 5000;
  
  if (text.length > maxTextLength) {
    return text.substring(0, maxTextLength) + "... (text was trimmed due to length constraints)";
  }
  
  return text;
};

// Store audio and update learning path
const storeAudioAndUpdatePath = async (supabase: any, pathId: string, audioData: Uint8Array) => {
  // Create a unique filename
  const timestamp = new Date().getTime();
  const filename = `audio_${pathId}_${timestamp}.mp3`;
  
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
  
  return publicUrl;
};

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
        model: "tts-1",
        voice: voice,
        input: trimmedText,
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
