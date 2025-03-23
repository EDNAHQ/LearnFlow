
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { topic, title, originalContent } = await req.json();

    if (!topic || !title) {
      return new Response(
        JSON.stringify({ error: 'Topic and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating deep dive content for: ${title} related to ${topic}`);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openAIApiKey
    });

    // Create a prompt for generating deep dive content
    const prompt = `
You are an expert educator specializing in creating clear, comprehensive learning materials.
Generate a detailed explanation about "${title}" which is related to the broader topic of "${topic}".

${originalContent ? `Here is some context about the original topic: ${originalContent}` : ''}

Create educational content that:
1. Introduces the topic and why it's important
2. Explains key concepts in a beginner-friendly way
3. Provides specific examples or applications
4. Highlights connections to the main topic
5. Includes a brief summary

Use Markdown formatting for headings, lists, and emphasis. Keep your explanation concise but thorough.
`;

    // Call OpenAI API with o3-mini model first, with fallback to gpt-4o-mini if needed
    try {
      console.log("Calling OpenAI API with o3-mini model");
      
      const completion = await openai.chat.completions.create({
        model: "o3-mini",
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 1500
      });
      
      const responseContent = completion.choices[0].message.content;
      
      if (!responseContent) {
        throw new Error("Empty response from OpenAI");
      }
      
      console.log("Successfully generated deep dive content");
      
      return new Response(
        JSON.stringify({ content: responseContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openaiError) {
      console.error("OpenAI API error with o3-mini:", openaiError);
      console.log("Falling back to gpt-4o-mini model");
      
      try {
        // Fallback to gpt-4o-mini model
        const fallbackCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500
        });
        
        const fallbackContent = fallbackCompletion.choices[0].message.content;
        
        if (!fallbackContent) {
          throw new Error("Empty response from fallback model");
        }
        
        console.log("Successfully generated fallback deep dive content");
        
        return new Response(
          JSON.stringify({ content: fallbackContent }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fallbackError) {
        console.error("Fallback model error:", fallbackError);
        throw new Error("Failed to generate content with both primary and fallback models");
      }
    }
  } catch (error) {
    console.error('Error in generate-deep-dive-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        content: `# ${error.message || 'Error Generating Content'}\n\nWe couldn't generate deep dive content at this time. Please try again later.`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
