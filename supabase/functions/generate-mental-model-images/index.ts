import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface ImageGenerationRequest {
  imageIds?: string[]  // For new table-based approach
  pathId: string
  prompts?: string[]   // For backward compatibility or creating new images
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageIds, pathId, prompts }: ImageGenerationRequest = await req.json()

    if (!pathId) {
      return new Response(
        JSON.stringify({ error: 'pathId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set')
    }

    console.log(`Processing request for path ${pathId}`)

    let imagesToProcess = []

    // If imageIds provided, fetch from database
    if (imageIds && imageIds.length > 0) {
      console.log(`Fetching ${imageIds.length} images from database`)

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mental_model_images?id=in.(${imageIds.join(',')})`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY || '',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status}`)
      }

      imagesToProcess = await response.json()
    }
    // If prompts provided, create new images in database first
    else if (prompts && prompts.length > 0) {
      console.log(`Creating ${prompts.length} new image records`)

      const newImages = prompts.map((prompt, index) => ({
        path_id: pathId,
        prompt,
        status: 'not_generated',
        display_order: index
      }))

      const createResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/mental_model_images`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY || '',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(newImages)
        }
      )

      if (!createResponse.ok) {
        throw new Error(`Failed to create image records: ${createResponse.status}`)
      }

      imagesToProcess = await createResponse.json()
    } else {
      return new Response(
        JSON.stringify({ error: 'Either imageIds or prompts must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${imagesToProcess.length} images`)

    // Process each image
    for (const image of imagesToProcess) {
      try {
        console.log(`Generating image ${image.id}: ${image.prompt.substring(0, 50)}...`)

        // Update status to generating
        await updateImageInDatabase(image.id, { status: 'generating' })

        // Call Replicate API
        const replicateResponse = await fetch(
          'https://api.replicate.com/v1/models/bytedance/seedream-4/predictions',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: {
                prompt: image.prompt,
                aspect_ratio: "16:9"
              },
            }),
          }
        )

        if (!replicateResponse.ok) {
          const errorText = await replicateResponse.text()
          console.error('Replicate API error:', errorText)
          throw new Error(`Replicate API error: ${replicateResponse.status}`)
        }

        const prediction = await replicateResponse.json()
        console.log(`Prediction created: ${prediction.id}`)

        // Poll for completion
        let imageUrl = null
        let attempts = 0
        const maxAttempts = 60

        while (attempts < maxAttempts) {
          const statusResponse = await fetch(
            `https://api.replicate.com/v1/predictions/${prediction.id}`,
            {
              headers: {
                'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
              },
            }
          )

          const status = await statusResponse.json()

          if (status.status === 'succeeded') {
            imageUrl = Array.isArray(status.output) ? status.output[0] : status.output
            console.log(`Image generated successfully`)
            break
          } else if (status.status === 'failed') {
            throw new Error('Image generation failed on Replicate')
          }

          await new Promise(resolve => setTimeout(resolve, 1000))
          attempts++
        }

        if (!imageUrl) {
          throw new Error('Image generation timed out')
        }

        // Download and store in Supabase Storage
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to download generated image')
        }

        const imageBlob = await imageResponse.blob()
        const imageBuffer = await imageBlob.arrayBuffer()

        // Upload to storage
        const timestamp = new Date().getTime()
        const filename = `mental_model_${pathId}_${image.id}_${timestamp}.jpg`

        const uploadResponse = await fetch(
          `${SUPABASE_URL}/storage/v1/object/mental_model_images/${filename}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'image/jpeg',
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
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/mental_model_images/${filename}`

        // Update database with completed status and URL
        await updateImageInDatabase(image.id, {
          status: 'completed',
          image_url: publicUrl,
          generated_at: new Date().toISOString()
        })

        console.log(`Image ${image.id} completed and stored`)

      } catch (error) {
        console.error(`Error generating image ${image.id}:`, error)
        await updateImageInDatabase(image.id, {
          status: 'failed',
          error: error.message || 'Unknown error'
        })
      }
    }

    const successCount = imagesToProcess.filter(img => img.status === 'completed').length

    return new Response(
      JSON.stringify({
        success: true,
        processed: imagesToProcess.length,
        completed: successCount,
        pathId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in generate-mental-model-images:', error)
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

async function updateImageInDatabase(imageId: string, updates: any): Promise<void> {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/mental_model_images?id=eq.${imageId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'apikey': SUPABASE_SERVICE_KEY || '',
      },
      body: JSON.stringify(updateData),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Failed to update image status: ${errorText}`)
    throw new Error(`Database update failed: ${response.status}`)
  }
}