
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the request body
  try {
    const { concept, definition, topic } = await req.json();

    if (!concept || !topic) {
      console.error("Missing concept or topic");
      return new Response(
        JSON.stringify({ error: "Concept and topic are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating explanation for concept: "${concept}" in topic: "${topic}"`);
    
    // Prepare the prompt for OpenAI
    const prompt = {
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educational assistant that helps explain concepts in depth."
        },
        {
          role: "user",
          content: `Provide a detailed explanation of the concept "${concept}" in the context of ${topic}. Here's a basic definition to start with: "${definition || 'No definition provided'}".
          
          Include the following in your explanation:
          1. A clear and comprehensive explanation of what this concept means
          2. How it relates to other concepts in ${topic}
          3. Real-world examples or applications where relevant
          4. Any important nuances or common misconceptions
          
          Format your response in markdown. Be thorough but concise (300-500 words).`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    };

    // Call OpenAI API
    console.log("Calling OpenAI API...");
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate explanation", 
          details: errorText 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log("OpenAI response received");
    const explanation = data.choices[0]?.message?.content;

    if (!explanation) {
      console.error("No explanation in OpenAI response:", data);
      return new Response(
        JSON.stringify({ error: "Empty explanation from OpenAI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ explanation }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
