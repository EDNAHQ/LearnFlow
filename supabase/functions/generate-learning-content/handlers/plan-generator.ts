
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
      
      const parsedContent = JSON.parse(generatedContent);
      
      if (!Array.isArray(parsedContent.steps)) {
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
      
      // Attempt to fix malformed JSON
      try {
        const content = data.choices[0].message.content;
        // Try to extract JSON part if it's wrapped in markdown or other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          const parsedJson = JSON.parse(extractedJson);
          
          if (Array.isArray(parsedJson.steps) && parsedJson.steps.length >= 5) {
            console.log("Successfully recovered JSON from malformed response");
            return new Response(
              JSON.stringify({ steps: parsedJson.steps }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (recoveryError) {
        console.error("Recovery attempt failed:", recoveryError);
      }
      
      throw new Error(`Failed to parse learning plan: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error generating learning plan:", error);
    throw error;
  }
}
