import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')

interface ImageGenerationRequest {
  prompt: string
  stepId?: string
  topic?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, stepId, topic }: ImageGenerationRequest = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set')
    }

    console.log('Generating image with Replicate:', { prompt, stepId, topic })

    // Enhance prompt for better thematic images and explicitly forbid any text/typography
    const enhancedPrompt = `${prompt}, abstract conceptual art, modern minimalist design, professional photography, dramatic lighting, high quality, clean composition, sophisticated, no text, no labels, no typography, no letters, no words`

    // Call Replicate API using black-forest-labs/flux-schnell model
    const replicateResponse = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: enhancedPrompt,
        },
      }),
    })

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      console.error('Replicate API error:', errorText)
      throw new Error(`Replicate API error: ${replicateResponse.status}`)
    }

    const prediction = await replicateResponse.json()
    console.log('Prediction created:', prediction.id)

    // Poll for completion
    let imageUrl = null
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      })

      const status = await statusResponse.json()

      if (status.status === 'succeeded') {
        imageUrl = status.output?.[0]?.url || status.output?.[0] || null
        console.log('Image generated successfully:', imageUrl)
        break
      } else if (status.status === 'failed') {
        throw new Error('Image generation failed')
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out')
    }

    // Download the image from Replicate
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image')
    }

    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()

    // Store in Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const timestamp = new Date().getTime()
    const filename = `presentation_${stepId || 'image'}_${timestamp}.webp`

    // Upload to presentation_images bucket
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/presentation_images/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'image/webp',
        },
        body: imageBuffer,
      }
    )

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Storage upload error:', errorText)
      throw new Error('Failed to upload image to storage')
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/presentation_images/${filename}`
    console.log('Image stored at:', publicUrl)

    // If stepId provided, update the learning_steps table
    if (stepId) {
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/learning_steps?id=eq.${stepId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            presentation_image_url: publicUrl,
          }),
        }
      )

      if (!updateResponse.ok) {
        console.error('Failed to update learning step with image URL')
      } else {
        console.log('Learning step updated with image URL')
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        stepId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in generate-presentation-image:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})