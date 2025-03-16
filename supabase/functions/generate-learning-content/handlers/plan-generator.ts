
import { callOpenAI } from "../utils/openai.ts";

export async function generateLearningPlan(topic: string, corsHeaders: Record<string, string>) {
  if (!topic) {
    return new Response(
      JSON.stringify({ error: 'Missing required topic parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Generate a learning plan using OpenAI with a focused prompt
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

  console.log("Generating focused learning plan for topic:", topic);
  
  try {
    const systemMessage = `You are an expert educator creating highly focused learning plans. Your plans should always be extremely specific to the requested topic without introducing unrelated concepts. YOU MUST RETURN VALID JSON.`;
    
    // Explicitly request JSON response format
    const data = await callOpenAI(prompt, systemMessage, "json_object");
    
    console.log("OpenAI response received successfully");
    
    try {
      // Parse the generated steps
      const generatedContent = data.choices[0].message.content;
      console.log("Generated content type:", typeof generatedContent);
      console.log("Generated content preview:", generatedContent.substring(0, 100) + "...");
      
      let parsedContent;
      try {
        // Add additional validation to ensure content is not empty
        if (!generatedContent || typeof generatedContent !== 'string' || generatedContent.trim() === '') {
          console.error("Empty or invalid content received from OpenAI");
          return new Response(
            JSON.stringify({ 
              error: "Empty or invalid content received from OpenAI",
              rawContent: generatedContent ? `${typeof generatedContent}: ${generatedContent.substring(0, 200)}...` : "null or undefined" 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        parsedContent = JSON.parse(generatedContent);
        console.log("JSON parsed successfully");
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Raw content causing parse error:", generatedContent);
        
        // Try to extract JSON from markdown if wrapped
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedContent = JSON.parse(jsonMatch[0]);
            console.log("Extracted JSON from markdown successfully");
          } catch (e) {
            console.error("Failed to extract JSON from markdown:", e);
            return new Response(
              JSON.stringify({ 
                error: "Invalid JSON format received from AI",
                rawContent: generatedContent.substring(0, 200) + "..." 
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          return new Response(
            JSON.stringify({ 
              error: "Could not parse AI response as JSON",
              rawContent: generatedContent.substring(0, 200) + "..." 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      if (!parsedContent || !Array.isArray(parsedContent.steps)) {
        console.error("Invalid response format - steps is not an array:", parsedContent);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response format: steps is not an array',
            receivedContent: JSON.stringify(parsedContent).substring(0, 200) + "..."
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (parsedContent.steps.length < 5) {
        console.error("Insufficient learning plan steps:", parsedContent.steps.length);
        return new Response(
          JSON.stringify({ error: 'Insufficient learning plan generated', steps: parsedContent.steps }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Successfully parsed ${parsedContent.steps.length} steps`);
      
      return new Response(
        JSON.stringify({ steps: parsedContent.steps }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing generated content:', parseError);
      console.error('Raw response content:', data.choices[0].message.content);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to parse learning plan: ${parseError.message}`,
          rawResponse: typeof data.choices[0].message.content === 'string' 
            ? data.choices[0].message.content.substring(0, 200) + "..."
            : JSON.stringify(data.choices[0].message.content) 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error generating learning plan:", error);
    return new Response(
      JSON.stringify({ error: `Failed to generate learning plan: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
