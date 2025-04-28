
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
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb", pathId } = await req.json()

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
    console.log("API key retrieved successfully");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      throw new Error('Supabase configuration missing')
    }
    console.log("Supabase configuration retrieved successfully");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if 'audio_files' bucket exists, create if not
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

    // First check if we already have an audio URL for this path
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .select('audio_url')
      .eq('id', pathId)
      .single();

    if (pathError) {
      console.error("Error fetching path data:", pathError);
    } else if (pathData?.audio_url) {
      console.log('Using existing audio URL:', pathData.audio_url);
      
      // Check if the file actually exists in storage
      const fileUrl = pathData.audio_url.split('/').pop();
      const { data: fileExists } = await supabase
        .storage
        .from('audio_files')
        .download(fileUrl);
        
      if (fileExists) {
        return new Response(
          JSON.stringify({ 
            audioUrl: pathData.audio_url,
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
      
      console.log("Existing audio file not found, regenerating...");
    }

    // Trim text if it's too long (ElevenLabs has limitations)
    const maxTextLength = 5000;
    const trimmedText = text.length > maxTextLength ? 
      text.substring(0, maxTextLength) + "... (text was trimmed due to length constraints)" : 
      text;

    console.log(`Text-to-speech request: ${trimmedText.length} characters, voice: ${voiceId}`);
    
    // Initialize ElevenLabs client
    const client = new ElevenLabsClient({
      apiKey: apiKey,
    });

    try {
      // Generate audio from text
      console.log("Calling ElevenLabs API...");
      const audioData = await client.textToSpeech.convert(voiceId, {
        output_format: "mp3_44100_128",
        text: trimmedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      });
      console.log("ElevenLabs API call completed");
      
      if (!audioData || audioData.length === 0) {
        console.error("No audio data received from Eleven Labs API");
        throw new Error('No audio data received from Eleven Labs API');
      }
      
      console.log(`Successfully generated audio: ${audioData.length} bytes`);

      // Create a unique filename
      const timestamp = new Date().getTime()
      const filename = `audio_${pathId}_${timestamp}.mp3`
      
      // Upload to Supabase Storage
      console.log(`Uploading audio file: ${filename}`);
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
      console.log("Audio file uploaded successfully");

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('audio_files')
        .getPublicUrl(filename)

      console.log(`Audio public URL: ${publicUrl}`);

      // Update the learning path with the audio URL
      console.log(`Updating learning path ${pathId} with audio URL`);
      const { error: updateError } = await supabase
        .from('learning_paths')
        .update({ audio_url: publicUrl })
        .eq('id', pathId)

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
