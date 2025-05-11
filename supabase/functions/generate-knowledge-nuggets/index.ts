
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
    
    // First try with gpt-4.1-mini
    let model = "gpt-4.1-mini";
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Attempt ${attempts} with model: ${model}`);
        
        // Call OpenAI to generate knowledge nuggets with improved prompt
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: `You are an expert educator specializing in creating engaging, insightful knowledge nuggets. 
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
              The response must be parseable by JSON.parse().`
            },
            { 
              role: 'user', 
              content: `Topic: ${topic}
              
              Return EXACTLY 5 knowledge nuggets in a JSON object with the "nuggets" key containing an array of strings.
              IMPORTANT: Respond with ONLY a valid JSON object. No explanations, no markdown, just pure JSON.` 
            }
          ],
          response_format: { type: "json_object" },
        });

        // Extract and validate the content
        let content = completion.choices[0].message.content;
        
        // Extra safety: ensure we have valid JSON
        try {
          // Try to extract JSON object if it's wrapped in other text
          if (!content.trim().startsWith('{')) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              content = jsonMatch[0];
            }
          }
          
          // Parse to validate JSON structure
          const responseData = JSON.parse(content);
          
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
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          console.error("Problematic content:", content);
          
          // If this is our first attempt with gpt-4.1-mini, try again with gpt-4o-mini
          if (attempts === 1) {
            console.log("Switching to gpt-4o-mini after JSON parsing error");
            model = "gpt-4o-mini";
            continue;
          }
          
          // Return fallback nuggets on error after all attempts
          return new Response(
            JSON.stringify({ 
              success: false,
              error: "Failed to parse AI response",
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
        console.error(`Error with model ${model}:`, error);
        
        // If this is our first attempt with gpt-4.1-mini, try again with gpt-4o-mini
        if (attempts === 1) {
          console.log("Switching to gpt-4o-mini after error");
          model = "gpt-4o-mini";
          continue;
        }
        
        // Return default nuggets on any error after all attempts
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
