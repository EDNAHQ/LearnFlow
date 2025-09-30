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

    const response = await aiClient.chat({
      functionType: 'deep-analysis',
      messages: [
        { role: 'user', content: prompt }
      ],
      maxTokens: 1500,
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