import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";

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

    // Initialize AI client
    const aiClient = createAIClient();

    // Create a prompt for generating brief overview content
    const prompt = `
You are an expert educator specializing in creating clear, concise learning overviews.
Generate a brief overview about "${title}" which is related to the broader topic of "${topic}".

${originalContent ? `Here is some context about the original topic: ${originalContent}` : ''}

Create a SHORT educational overview that:
- Is only 2-3 paragraphs total
- Introduces what this topic is and why it matters
- Explains 2-3 key concepts briefly
- Shows how it connects to the main topic

Keep it concise and engaging - this is a preview to help learners decide if they want to explore this topic further.
Use simple Markdown formatting if needed. NO lengthy explanations.
`;

    const response = await aiClient.chat({
      functionType: 'quick-insights',
      messages: [
        { role: 'user', content: prompt }
      ],
      maxTokens: 400,
    });

    const responseContent = response.content;

    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    console.log(`Successfully generated deep dive content using ${response.model}`);

    return new Response(
      JSON.stringify({ content: responseContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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