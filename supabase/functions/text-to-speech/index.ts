
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, initSupabaseClient, ensureAudioBucketExists, checkExistingAudio, prepareTextForGeneration, storeAudioAndUpdatePath } from "../_shared/utils.ts"
import { generateAudio } from "./elevenlabs.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Text-to-speech function called")
    
    // Parse the request body to get the text and pathId
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb", pathId } = await req.json()

    if (!text) {
      console.error("No text provided for speech generation")
      throw new Error('Text is required')
    }

    if (!pathId) {
      console.error("No pathId provided")
      throw new Error('PathId is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = initSupabaseClient(supabaseUrl!, supabaseServiceKey!)
    console.log("Supabase client initialized successfully")
    
    // Ensure audio_files bucket exists
    await ensureAudioBucketExists(supabase)
    
    // Check for existing audio
    const existingAudioUrl = await checkExistingAudio(supabase, pathId)
    if (existingAudioUrl) {
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
      )
    }

    // Prepare text for generation
    const trimmedText = prepareTextForGeneration(text)
    
    // Generate audio from text
    const audioData = await generateAudio(trimmedText, voiceId)
    
    // Store audio and update learning path
    const publicUrl = await storeAudioAndUpdatePath(supabase, pathId, audioData)
    
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
    )
  } catch (error) {
    console.error('Error in text-to-speech function:', error.message)
    
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
    )
  }
});
