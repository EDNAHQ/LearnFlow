import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    // Parse request body
    const { topic } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating knowledge nuggets for topic: ${topic}`);

    // Initialize AI client
    const aiClient = createAIClient();

    const systemMessage = `You are an expert educator specializing in creating engaging, insightful knowledge nuggets.
              Your goal is to generate 5 fascinating, thought-provoking facts or insights about the given topic
              that will genuinely surprise and intrigue learners. Each nugget should:

              1. Be concise (160-200 characters) but still impactful
              2. Reveal a non-obvious or counterintuitive aspect about the topic
              3. Connect the topic to real-world applications or surprising contexts
              4. Use clear, precise language with specific examples where possible
              5. Spark curiosity and the desire to learn more

              IMPORTANT RESTRICTIONS:
              - NEVER use the words "realm" or "delve" in any context
              - Focus purely on the content without meta-references
              - Keep each nugget to 1-2 sentences maximum

              YOUR RESPONSE MUST BE VALID JSON with this exact structure:
              {"nuggets": ["nugget 1", "nugget 2", "nugget 3", "nugget 4", "nugget 5"]}

              DO NOT include any text outside the JSON object. No markdown formatting, no code blocks, no explanations.
              The response must be parseable by JSON.parse().`;

    const userPrompt = `Topic: ${topic}

              Return EXACTLY 5 knowledge nuggets in a JSON object with the "nuggets" key containing an array of strings.
              IMPORTANT: Respond with ONLY a valid JSON object. No explanations, no markdown, just pure JSON.`;

    try {
      const response = await aiClient.chat({
        functionType: 'structured-extraction',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ],
        responseFormat: 'json_object',
      });

      console.log(`AI response received from ${response.provider} (${response.model})`);

      // Parse and validate the JSON response
      const responseData = JSON.parse(response.content);

      // Ensure nuggets array exists and has items
      if (!responseData.nuggets || !Array.isArray(responseData.nuggets)) {
        throw new Error("Response missing nuggets array");
      }

      return new Response(
        JSON.stringify({
          success: true,
          nuggets: responseData.nuggets,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error generating nuggets:", error);

      // Return fallback nuggets on error
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Failed to generate nuggets",
          nuggets: [
            `Components in modern frameworks follow a composition pattern where smaller, focused pieces combine to create complex UIs.`,
            `Custom hooks in React extract and share stateful logic between components without forcing component hierarchy changes.`,
            `React's useState implementation uses a linked list internally to maintain state between renders.`,
            `The dependency array in useEffect is a performance optimization that prevents unnecessary effect executions.`,
            `JavaScript's event loop manages asynchronous operations by processing the call stack, callback queue, and microtask queue.`
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-knowledge-nuggets function:', error);

    // Return default nuggets on any error
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        nuggets: [
          `Components in modern frameworks follow a composition pattern where smaller, focused pieces combine to create complex UIs.`,
          `Custom hooks in React extract and share stateful logic between components without forcing component hierarchy changes.`,
          `React's useState implementation uses a linked list internally to maintain state between renders.`,
          `The dependency array in useEffect is a performance optimization that prevents unnecessary effect executions.`,
          `JavaScript's event loop manages asynchronous operations by processing the call stack, callback queue, and microtask queue.`
        ]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});