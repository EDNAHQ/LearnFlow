
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
    const systemMessage = `You are an expert educator creating highly focused learning plans. Your plans should always be extremely specific to the requested topic without introducing unrelated concepts.`;
    const data = await callOpenAI(prompt, systemMessage, "json_object");
    
    console.log("OpenAI response received successfully");
    
    try {
      // Parse the generated steps
      const generatedContent = data.choices[0].message.content;
      console.log("Generated content:", generatedContent);
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(generatedContent);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Try to extract JSON from markdown if wrapped
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedContent = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error("Failed to extract JSON from markdown:", e);
            throw new Error("Invalid JSON format received from AI");
          }
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
      
      if (!parsedContent || !Array.isArray(parsedContent.steps)) {
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
      return new Response(
        JSON.stringify({ error: `Failed to parse learning plan: ${parseError.message}` }),
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
