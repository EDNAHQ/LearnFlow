
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { generateAudio } from "./elevenlabs.ts"

// Initialize Supabase client with proper error handling
const initSupabaseClient = (url: string, key: string) => {
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(url, key)
}

// Check if audio_files bucket exists, create if not
const ensureAudioBucketExists = async (supabase: any) => {
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
  
  if (bucketsError) {
    console.error("Error listing buckets:", bucketsError)
    throw new Error(`Failed to list buckets: ${bucketsError.message}`)
  }
  
  const audioBucketExists = buckets?.some(bucket => bucket.name === 'audio_files')
  
  if (!audioBucketExists) {
    console.log("Creating audio_files bucket")
    const { error: createBucketError } = await supabase.storage.createBucket('audio_files', {
      public: true,
      fileSizeLimit: 50000000 // 50MB
    })
    
    if (createBucketError) {
      console.error("Error creating audio_files bucket:", createBucketError)
      throw new Error(`Failed to create audio_files bucket: ${createBucketError.message}`)
    }
  }
}

// Check if an audio file already exists for this path
const checkExistingAudio = async (supabase: any, pathId: string) => {
  const { data: pathData, error: pathError } = await supabase
    .from('learning_paths')
    .select('audio_url')
    .eq('id', pathId)
    .single()

  if (pathError) {
    console.error("Error fetching path data:", pathError)
    return null
  }

  if (pathData?.audio_url) {
    console.log('Found existing audio URL:', pathData.audio_url)
    
    // Check if the file actually exists in storage
    const fileUrl = pathData.audio_url.split('/').pop()
    if (!fileUrl) return null
    
    try {
      const { data: fileExists } = await supabase
        .storage
        .from('audio_files')
        .download(fileUrl)
        
      if (fileExists) {
        return pathData.audio_url
      }
    } catch (err) {
      console.log("Existing audio file not found, will regenerate")
    }
  }
  
  return null
}

// Prepare text for generation by handling length limitations
const prepareTextForGeneration = (text: string) => {
  const maxTextLength = 5000
  
  if (text.length > maxTextLength) {
    return text.substring(0, maxTextLength) + "... (text was trimmed due to length constraints)"
  }
  
  return text
}

// Store audio and update learning path
const storeAudioAndUpdatePath = async (supabase: any, pathId: string, audioData: Uint8Array) => {
  // Create a unique filename
  const timestamp = new Date().getTime()
  const filename = `audio_${pathId}_${timestamp}.mp3`
  
  // Upload to Supabase Storage
  console.log(`Uploading audio file: ${filename}`)
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('audio_files')
    .upload(filename, audioData, {
      contentType: 'audio/mpeg',
      cacheControl: '3600'
    })

  if (uploadError) {
    console.error('Error uploading audio:', uploadError)
    throw new Error(`Failed to upload audio: ${uploadError.message}`)
  }
  console.log("Audio file uploaded successfully")

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase
    .storage
    .from('audio_files')
    .getPublicUrl(filename)

  console.log(`Audio public URL: ${publicUrl}`)

  // Update the learning path with the audio URL
  console.log(`Updating learning path ${pathId} with audio URL`)
  const { error: updateError } = await supabase
    .from('learning_paths')
    .update({ audio_url: publicUrl })
    .eq('id', pathId)

  if (updateError) {
    console.error('Error updating learning path:', updateError)
    throw new Error(`Failed to update learning path: ${updateError.message}`)
  }
  console.log("Learning path updated successfully")
  
  return publicUrl
}

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
