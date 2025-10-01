import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { generateMentalModelPromptsForPath } from "../generate-learning-content/handlers/mental-model-prompts.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pathId, topic, stepTitles, pathSummary, generateImagesNow = false } = await req.json()

    if (!pathId || !topic) {
      return new Response(
        JSON.stringify({ error: 'pathId and topic are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Generating mental model prompts for path: ${pathId} (${topic})`)

    // Generate prompts
    const imagePrompts = await generateMentalModelPromptsForPath(topic, stepTitles, pathSummary)
    console.log('Generated prompts:', imagePrompts)

    // Create records in the mental_model_images table
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // First check if images already exist for this path
    const { data: existingImages } = await supabase
      .from('mental_model_images')
      .select('id')
      .eq('path_id', pathId)
      .limit(1)

    if (existingImages && existingImages.length > 0) {
      console.log('Mental model images already exist for this path')
      return new Response(
        JSON.stringify({
          success: true,
          pathId,
          promptsGenerated: 0,
          prompts: [],
          message: 'Mental model images already exist for this path'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const imagesToCreate = imagePrompts.map((prompt, index) => ({
      path_id: pathId,
      prompt,
      status: 'not_generated',
      display_order: index
    }))

    // Insert records into mental_model_images table
    const { data: createdImages, error: insertError } = await supabase
      .from('mental_model_images')
      .insert(imagesToCreate)
      .select()

    if (insertError) {
      console.error('Failed to create image records:', insertError)
      throw insertError
    }

    console.log(`Created ${createdImages?.length || 0} image records in database`)

    // Only generate images if explicitly requested
    if (generateImagesNow && createdImages && createdImages.length > 0) {
      const imageGenUrl = `${SUPABASE_URL}/functions/v1/generate-mental-model-images`

      const imageGenResponse = await fetch(imageGenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pathId,
          imageIds: createdImages.map(img => img.id)
        })
      })

      if (!imageGenResponse.ok) {
        const errorText = await imageGenResponse.text()
        console.error('Image generation failed:', errorText)
        throw new Error(`Image generation failed: ${imageGenResponse.status}`)
      }

      console.log('Image generation initiated')
    }

    return new Response(
      JSON.stringify({
        success: true,
        pathId,
        promptsGenerated: imagePrompts.length,
        prompts: imagePrompts,
        message: generateImagesNow ? 'Mental model generation started' : 'Mental model prompts created'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-path-mental-models:', error)
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
