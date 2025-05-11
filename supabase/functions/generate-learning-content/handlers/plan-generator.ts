
import { callOpenAI } from "../utils/openai/index.ts";

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
  
  YOUR RESPONSE MUST BE VALID JSON with this exact structure:
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
      // ... and so on, exactly 10 steps total
    ]
  }
  
  Ensure you format this as valid JSON with no trailing commas. Include exactly 10 steps, starting with fundamentals and moving to more advanced concepts.
  The response must be parseable by JSON.parse().
  `;

  console.log("Generating focused learning plan for topic:", topic);
  
  try {
    const systemMessage = `You are an expert educator creating highly focused learning plans. Your plans should always be extremely specific to the requested topic without introducing unrelated concepts. 
    
    YOU MUST RETURN VALID JSON WITHOUT TRAILING COMMAS OR OTHER SYNTAX ERRORS. 
    
    Do not include markdown formatting, code blocks, or any text outside the JSON object. 
    The response must be parseable by JSON.parse().`;
    
    // Explicitly request JSON response format
    const data = await callOpenAI(prompt, systemMessage, "json_object");
    
    console.log("OpenAI response received successfully");
    
    try {
      // Parse the generated steps
      const generatedContent = data.choices[0].message.content;
      console.log("Generated content type:", typeof generatedContent);
      console.log("Generated content preview:", generatedContent.substring(0, 100) + "...");
      
      // Parse the content
      const parsedContent = JSON.parse(generatedContent);
      
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
