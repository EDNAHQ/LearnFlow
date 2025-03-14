
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
    const { topic, pathId } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required topic parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating title for topic: ${topic}`);
    
    // Generate a title using OpenAI
    const prompt = `
    You are an expert educator creating a catchy, professional title for a learning path.
    
    The learning path is about: "${topic}"
    
    Please create a concise, engaging title that captures the essence of learning about ${topic}.
    The title should be:
    1. Professional and educational
    2. No more than 5-7 words
    3. Clearly related to ${topic}
    4. NOT contain words like "mastering" or "journey" or "introduction"
    5. NOT contain the phrase "Learning Path"
    
    Respond with ONLY the title text, nothing else.
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
            content: `You are an expert educator creating concise, professional titles for learning content.` 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let generatedTitle = data.choices[0].message.content.trim();
    
    // Remove quotes if present
    generatedTitle = generatedTitle.replace(/^["'](.+)["']$/, '$1');
    
    console.log(`Generated title: ${generatedTitle}`);

    // If pathId is provided, update the learning path title
    if (pathId) {
      // Create a Supabase client for admin operations
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { error: updateError } = await supabase
        .from('learning_paths')
        .update({ title: generatedTitle })
        .eq('id', pathId);
        
      if (updateError) {
        console.error("Error updating path title:", updateError);
        // Continue anyway since we have the title
      } else {
        console.log(`Successfully updated title for path ${pathId}`);
      }
    }

    return new Response(
      JSON.stringify({ title: generatedTitle }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-learning-title function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
