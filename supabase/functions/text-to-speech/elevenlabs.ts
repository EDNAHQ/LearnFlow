
import { ElevenLabsClient } from "https://esm.sh/elevenlabs@0.2.2"

// Generate audio using ElevenLabs API
export const generateAudio = async (text: string, voiceId: string) => {
  const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
  if (!apiKey) {
    console.error("ELEVEN_LABS_API_KEY is not configured")
    throw new Error('ELEVEN_LABS_API_KEY is not configured')
  }
  console.log("API key retrieved successfully")

  // Initialize ElevenLabs client
  const client = new ElevenLabsClient({
    apiKey: apiKey,
  })

  try {
    // Generate audio from text
    console.log(`Calling ElevenLabs API with voice ${voiceId} and text length ${text.length}`)
    
    const audioData = await client.textToSpeech.convert(voiceId, {
      output_format: "mp3_44100_128",
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    })
    
    console.log("ElevenLabs API call completed")
    
    if (!audioData || audioData.length === 0) {
      console.error("No audio data received from Eleven Labs API")
      throw new Error('No audio data received from Eleven Labs API')
    }
    
    console.log(`Successfully generated audio: ${audioData.length} bytes`)
    return audioData
  } catch (elevenlabsError) {
    console.error('Eleven Labs API error:', elevenlabsError)
    let errorMessage = 'Eleven Labs API error'
    
    if (elevenlabsError.response) {
      try {
        const errorBody = await elevenlabsError.response.text()
        errorMessage = `Eleven Labs API error (${elevenlabsError.response.status}): ${errorBody}`
      } catch (e) {
        errorMessage = `Eleven Labs API error: Status code ${elevenlabsError.response.status}`
      }
    } else {
      errorMessage = `Eleven Labs API error: ${elevenlabsError.message || 'Unknown error'}`
    }
    
    throw new Error(errorMessage)
  }
}
