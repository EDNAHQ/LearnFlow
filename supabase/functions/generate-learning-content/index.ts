
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

      // Generate a learning plan using OpenAI
      const prompt = `
      You are an expert educator creating a learning plan for the topic: "${topic}".
      
      Please create a comprehensive 10-step learning plan that will guide someone from beginner to advanced level on this topic.
      
      For each step, provide:
      1. A clear, concise title (5-7 words max)
      2. A brief one-sentence description of what the learner will understand after completing this step
      
      Format your response as a JSON array of objects with 'title' and 'description' properties.
      Example: 
      [
        {
          "title": "Introduction to the Fundamentals",
          "description": "Understand the core principles and basic terminology."
        },
        ...
      ]
      
      The steps should be in a logical progression, starting with fundamentals and moving to more advanced concepts.
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert educator creating learning plans.' },
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

      try {
        // Parse the generated steps
        const generatedContent = data.choices[0].message.content;
        const parsedContent = JSON.parse(generatedContent);
        
        if (!Array.isArray(parsedContent.steps) || parsedContent.steps.length < 5) {
          throw new Error('Invalid or insufficient learning plan generated');
        }
        
        return new Response(
          JSON.stringify({ steps: parsedContent.steps }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('Error parsing generated content:', parseError, data.choices[0].message.content);
        throw new Error(`Failed to parse learning plan: ${parseError.message}`);
      }
    } else {
      // Original detailed content generation code
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

      // Generate content with OpenAI
      const prompt = `
      You are an expert educator creating learning content about "${topic}". 
      
      This is step ${stepNumber} of ${totalSteps} in a comprehensive learning path.
      
      The title of this section is: "${title}"
      
      Please generate detailed, educational content for this section. Include:
      
      1. A clear introduction to this aspect of ${topic}
      2. Key concepts and principles relevant to ${title}
      3. Practical examples or applications
      4. Common misconceptions or challenges
      5. Summary of key takeaways
      
      Make it educational, engaging, and around 500-700 words. Format with paragraphs for readability.
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert educator creating learning content.' },
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
