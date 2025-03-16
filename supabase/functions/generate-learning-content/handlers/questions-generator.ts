
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
  
  YOUR RESPONSE MUST BE VALID JSON with this exact structure:
  {
    "questions": [
      "First question related to the content?",
      "Second question related to the content?",
      "Third question related to the content?",
      "Fourth question related to the content?",
      "Fifth question related to the content?"
    ]
  }
  
  Ensure you format this as valid JSON with no trailing commas. The response must be parseable by JSON.parse().
  Do not include any text outside of this JSON structure.
  `;

  console.log(`Calling OpenAI API to generate related questions for: ${title}`);
  
  try {
    const systemMessage = `You are an expert educator creating thoughtful questions to explore topics in depth based on specific content. 
    
    YOU MUST RETURN VALID JSON WITHOUT TRAILING COMMAS OR OTHER SYNTAX ERRORS. 
    
    Do not include markdown formatting, code blocks, or any text outside the JSON object. 
    The response must be parseable by JSON.parse().`;
    
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
      
      // Fallback: return generic questions
      return new Response(
        JSON.stringify({ 
          questions: [
            `What are the key concepts of ${title} as presented in this content?`,
            `How does ${title} relate to real-world applications?`,
            `What challenges might arise when implementing ${title}?`,
            `How could the concepts in ${title} be expanded upon or improved?`,
            `What connections exist between ${title} and other areas of ${topic}?`
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error(`Error generating questions for ${title}:`, error);
    
    // Fallback: return generic questions on error
    return new Response(
      JSON.stringify({ 
        error: error.message,
        questions: [
          `What are the key concepts of ${title} as presented in this content?`,
          `How does ${title} relate to real-world applications?`,
          `What challenges might arise when implementing ${title}?`,
          `How could the concepts in ${title} be expanded upon or improved?`,
          `What connections exist between ${title} and other areas of ${topic}?`
        ]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
