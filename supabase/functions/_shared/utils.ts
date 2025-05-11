
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client with proper error handling
export const initSupabaseClient = (url: string, key: string) => {
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(url, key)
}

// Check if audio_files bucket exists, create if not
export const ensureAudioBucketExists = async (supabase: any) => {
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
export const checkExistingAudio = async (supabase: any, pathId: string) => {
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
export const prepareTextForGeneration = (text: string) => {
  const maxTextLength = 5000
  
  if (text.length > maxTextLength) {
    return text.substring(0, maxTextLength) + "... (text was trimmed due to length constraints)"
  }
  
  return text
}

// Store audio and update learning path
export const storeAudioAndUpdatePath = async (supabase: any, pathId: string, audioData: Uint8Array) => {
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
