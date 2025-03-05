
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { stepId, topic, title, stepNumber, totalSteps, generatePlan } = await req.json();

    // Create a Supabase client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If generatePlan is true, we'll generate a learning plan
    if (generatePlan) {
      if (!topic) {
        return new Response(
          JSON.stringify({ error: 'Missing required topic parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a learning plan using OpenAI with an improved, more focused prompt
      const prompt = `
      You are an expert educator creating a highly focused and specialized learning plan for the topic: "${topic}".
      
      Please create a comprehensive 10-step learning plan that will guide someone from beginner to advanced level SPECIFICALLY on the topic of ${topic}. 
      The plan should be laser-focused on ${topic} without including tangential or loosely related topics.
      
      For each step, provide:
      1. A clear, concise title (5-7 words max) that directly relates to ${topic}
      2. A brief one-sentence description of what the learner will understand about ${topic} after completing this step
      
      Each step should build logically on the previous one, creating a coherent progression from fundamentals to advanced concepts, 
      all while staying strictly within the boundaries of ${topic}.
      
      Your response should be structured as an array of step objects with 'title' and 'description' fields, formatted as valid JSON.
      
      Example format:
      {
        "steps": [
          {
            "title": "Introduction to [Specific Aspect of ${topic}]",
            "description": "Understand the core principles of ${topic} and essential terminology."
          },
          {
            "title": "Second Step Title About ${topic}",
            "description": "Brief description focusing specifically on ${topic}"
          }
        ]
      }
      
      Make sure to include exactly 10 steps, starting with fundamentals and moving to more advanced concepts,
      all directly related to ${topic}.
      `;

      console.log("Calling OpenAI API to generate focused learning plan for topic:", topic);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'o3-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are an expert educator creating highly focused learning plans. Your plans should always be extremely specific to the requested topic without introducing unrelated concepts.` 
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI API error:', data);
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      }

      console.log("OpenAI response received successfully");
      
      try {
        // Parse the generated steps
        const generatedContent = data.choices[0].message.content;
        console.log("Generated content:", generatedContent);
        
        const parsedContent = JSON.parse(generatedContent);
        
        if (!Array.isArray(parsedContent.steps)) {
          console.error("Invalid response format - steps is not an array:", parsedContent);
          throw new Error('Invalid response format: steps is not an array');
        }
        
        if (parsedContent.steps.length < 5) {
          console.error("Insufficient learning plan steps:", parsedContent.steps.length);
          throw new Error('Insufficient learning plan generated');
        }
        
        console.log(`Successfully parsed ${parsedContent.steps.length} steps`);
        
        return new Response(
          JSON.stringify({ steps: parsedContent.steps }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('Error parsing generated content:', parseError, data.choices[0].message.content);
        
        // Attempt to fix malformed JSON
        try {
          const content = data.choices[0].message.content;
          // Try to extract JSON part if it's wrapped in markdown or other text
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedJson = jsonMatch[0];
            const parsedJson = JSON.parse(extractedJson);
            
            if (Array.isArray(parsedJson.steps) && parsedJson.steps.length >= 5) {
              console.log("Successfully recovered JSON from malformed response");
              return new Response(
                JSON.stringify({ steps: parsedJson.steps }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (recoveryError) {
          console.error("Recovery attempt failed:", recoveryError);
        }
        
        throw new Error(`Failed to parse learning plan: ${parseError.message}`);
      }
    } else {
      // Original detailed content generation code with improved focus
      if (!stepId || !topic || !title) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if content already exists
      const { data: existingData, error: fetchError } = await supabase
        .from('learning_steps')
        .select('detailed_content')
        .eq('id', stepId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching step:", fetchError);
        throw new Error("Failed to check existing content");
      }

      if (existingData?.detailed_content) {
        return new Response(
          JSON.stringify({ content: existingData.detailed_content }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Generating content for step: ${title} (${stepNumber}/${totalSteps})`);
      
      // Generate content with OpenAI with improved focus
      const prompt = `
      You are an expert educator creating highly specialized learning content about "${topic}". 
      
      This is step ${stepNumber} of ${totalSteps} in a focused learning path about ${topic}.
      
      The title of this section is: "${title}"
      
      Please generate detailed, educational content for this specific section. The content should be:
      - Laser-focused on the exact aspect of ${topic} indicated in the title
      - Relevant only to ${topic} without tangential discussions
      - Appropriate for the current step (${stepNumber} of ${totalSteps}) in the learning progression
      
      Include:
      
      1. A clear introduction to this specific aspect of ${topic}
      2. Key concepts and principles that are directly relevant to "${title}" within the context of ${topic}
      3. Practical examples or applications that demonstrate this specific aspect of ${topic}
      4. Common misconceptions or challenges related specifically to this aspect of ${topic}
      5. Summary of key takeaways that relate strictly to this aspect of ${topic}
      
      Make it educational, engaging, and around 500-700 words. Format with paragraphs for readability.
      
      Remember to stay strictly on topic and focused on ${topic} as it relates to "${title}" - avoid introducing tangential concepts or going off on unrelated tangents.
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'o3-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are an expert educator creating highly focused learning content. Your content should always be extremely specific to the requested topic and title without introducing unrelated concepts.` 
            },
            { role: 'user', content: prompt }
          ],
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI API error:', data);
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      }

      const generatedContent = data.choices[0].message.content;
      console.log(`Content successfully generated (${generatedContent.length} characters)`);

      // Save the generated content to the database
      const { error: updateError } = await supabase
        .from('learning_steps')
        .update({ detailed_content: generatedContent })
        .eq('id', stepId);

      if (updateError) {
        console.error("Error updating content:", updateError);
        throw new Error("Failed to save generated content");
      }

      return new Response(
        JSON.stringify({ content: generatedContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-learning-content function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
