
import { callOpenAI } from "../utils/openai.ts";

export async function generateQuestions(content: string, topic: string, title: string, corsHeaders: Record<string, string>) {
  if (!content || !topic) {
    return new Response(
      JSON.stringify({ error: 'Missing required content or topic parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Generating questions for topic: ${topic}, title: ${title}`);
  
  // Generate related questions using OpenAI
  const prompt = `
  You are an expert educator helping students explore a topic in more depth.
  
  Below is content about "${topic}" with the title "${title}".
  
  CONTENT:
  ${content.substring(0, 4000)}
  
  Based on this specific content, generate exactly 5 thought-provoking questions that would help a learner explore this topic more deeply.
  
  Requirements for the questions:
  1. Each question should address an important concept or idea from THIS SPECIFIC content
  2. Questions should encourage critical thinking, not just recall facts
  3. Questions should be concise but specific (15-30 words each)
  4. Each question should explore a different aspect of the content
  5. Make sure questions end with a question mark
  6. Questions must be DIRECTLY related to the content provided, not generic questions about the topic
  
  Your response should be structured as an array of question strings formatted as valid JSON.
  Example format:
  {
    "questions": [
      "How does concept X relate to concept Y in the context of ${topic}?",
      "What would happen if we applied principle Z to a different scenario?",
      "Why is the relationship between A and B important for understanding ${topic}?"
    ]
  }
  `;

  console.log(`Calling OpenAI API to generate related questions for: ${title}`);
  
  try {
    const systemMessage = `You are an expert educator creating thoughtful questions to explore topics in depth based on specific content.`;
    const data = await callOpenAI(prompt, systemMessage, "json_object");
    
    console.log(`OpenAI response received successfully for questions about: ${title}`);
    
    try {
      // Parse the generated questions
      const generatedContent = data.choices[0].message.content;
      console.log(`Generated questions content length: ${generatedContent.length}`);
      
      const parsedContent = JSON.parse(generatedContent);
      
      if (!Array.isArray(parsedContent.questions)) {
        console.error("Invalid response format - questions is not an array:", parsedContent);
        throw new Error('Invalid response format: questions is not an array');
      }
      
      console.log(`Successfully parsed ${parsedContent.questions.length} questions for: ${title}`);
      
      return new Response(
        JSON.stringify({ questions: parsedContent.questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing generated questions:', parseError, data.choices[0].message.content);
      
      // Attempt to fix malformed JSON
      try {
        const content = data.choices[0].message.content;
        // Try to extract JSON part if it's wrapped in markdown or other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          const parsedJson = JSON.parse(extractedJson);
          
          if (Array.isArray(parsedJson.questions) && parsedJson.questions.length > 0) {
            console.log(`Successfully recovered JSON from malformed response for: ${title}`);
            return new Response(
              JSON.stringify({ questions: parsedJson.questions }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (recoveryError) {
        console.error("Recovery attempt failed:", recoveryError);
      }
      
      throw new Error(`Failed to parse questions: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`Error generating questions for ${title}:`, error);
    throw error;
  }
}
