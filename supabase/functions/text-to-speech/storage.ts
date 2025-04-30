
// Store generated audio in Supabase Storage and update learning path
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
